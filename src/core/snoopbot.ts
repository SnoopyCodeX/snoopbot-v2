import dotenv from "dotenv"
import { getType, multilineRegex, pipeline } from './utils/utils'
import global from './global'
import Settings from "./settings"
import Logger from "./utils/logger"
import Command from "./command"
import Queue from "./queue"

const login = require('fca-unofficial')
dotenv.config()

export default class SnoopBot {
    private commands: Array<Command> = []
    private commandMiddlewares: Array<Function> = []
    private eventMiddlewares: Array<Function> = []
    private appstate: String = '[]'
    private queue: Queue = new Queue(1, "GlobalQueue")

    private options: SnoopBotOptions = {
        configs: {},
        handleMatches: false,

        selfListen: false,
        listenEvents: true,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: true,
        autoMarkRead: false,
        autoReconnect: true,
        logRecordSize: 100,
        online: true,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML; like Gecko) Version/8.0.3 Safari/600.3.18"
    }

    public constructor() {
        this.appstate = process.env.APPSTATE ?? '[]'
    }

    public addCommand(command: Command) : void {
        this.commands.push(command);
    }

    private getCommandsOptions() : Array<SnoopBotCommandOptions> {
        return this.commands.map((command) => command.options)
    }

    public addCommandMiddleware(...commandMiddleware: Array<Function>) : void {
        this.commandMiddlewares.push(...commandMiddleware)
    }

    public addEventMiddleware(...eventMiddleware: Array<Function>) : void {
        this.eventMiddlewares.push(...eventMiddleware)
    }

    public init(options: SnoopBotOptions = this.options) : void {
        this.options = {
            ...this.options,
            ...options,
        }

        try {
            Logger.muted('Logging in...')

            login({ appState: JSON.parse(this.appstate.toString()) }, (error: any, api: any) => {
                if(error) return Logger.error(`Failed to login, please check the provided credentials.`)

                Logger.muted('Logged in successfully...')
                Logger.success('I am up and running!🚀')

                let settings = Settings.getSettings()
                let prefix = settings.defaultSettings.prefix

                api.setOptions({
                    listenEvents: this.options.listenEvents,
                    selfListen: this.options.selfListen
                })

                Logger.muted('Listening for messages...')

                api.listen(async (error: any, event: any) => {
                    if(error) return Logger.error(`Listening failed, cause: ${error}`)

                    process.env.APPSTATE = JSON.stringify(api.getAppState())

                    const eventCallback = () => async(event: any, api: any) => {}
                    global.eventsQueue.enqueue(async() => await pipeline([...this.eventMiddlewares, eventCallback], event, api))

                    settings = Settings.getSettings()
                    const threadSettings = settings.threads[event.threadID] || settings.defaultSettings
                    prefix = threadSettings.prefix

                    this.commands.forEach((command) => {
                        if((getType(command.execute) === 'Function' || getType(command.execute) === 'AsyncFunction') && event.body !== undefined) {
                            const _prefix_ = event.body.substring(0, prefix.length)

                            if(command.options.params === undefined)
                                return Logger.error('No commands added, please add at least 1 command')

                            const commandPrefix = command.options.prefix || prefix
                            let commandBody = event.body.substring(prefix.length).replace(/\n/g, " ")

                            const regexp = new RegExp(command.options.params.toString(), "gim")
                            const matches = multilineRegex(regexp, commandBody)
                            const handleMatches = command.options.handleMatches === undefined
                                ? options.handleMatches === undefined
                                    ? false
                                    : options.handleMatches
                                : command.options.handleMatches

                            if((commandPrefix == _prefix_ && matches.length !== 0) || handleMatches) {
                                let extras = {
                                    ...command.options,
                                    commands: this.getCommandsOptions(),
                                    global
                                }

                                const commandCallback = () => async(matches: Array<any>, event: any, api: any, extras: any) => command.execute(matches, event, api, extras)
                                this.queue.enqueue(async () => await pipeline([...this.commandMiddlewares, commandCallback], matches, event, api, extras))
                            }
                        }
                    })
                })
            })
        } catch(exception: any) {
            Logger.error(`${exception}`)
        }

        process.on("uncaughtException", (error: Error) => Logger.error(`Uncaught exception, cause: ${error.message}`))
    }
}