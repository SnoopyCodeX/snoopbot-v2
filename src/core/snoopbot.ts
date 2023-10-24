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
    private events: SnoopBotThreadEvent = {}
    private commandMiddlewares: Array<Function> = []
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

    private getCommandsOptions() : Array<SnoopBotCommandOptions> {
        return this.commands.map((command) => command.options)
    }
    
    /**
     * Creates a new SnoopBot instance
     * and loads facebook appstate from
     * environment variables
     */
    public constructor() {
        this.appstate = process.env.APPSTATE ?? '[]'
    }

    /**
     * Adds new command that SnoopBot will
     * execute.
     * 
     * @param command The command to be added to SnoopBot
     */
    public addCommand(command: Command) : void {
        this.commands.push(command);
    }

    /**
     * Adds a new command middleware. This middleware will be
     * the first executed before executing the actual commands
     * registered in SnoopBot.
     * 
     * @param commandMiddleware Command middleware to be added
     */
    public addCommandMiddleware(...commandMiddleware: Array<Function>) : void {
        this.commandMiddlewares.push(...commandMiddleware)
    }

    /**
     * Listens to thread events that are triggered
     * on specific actions in a thread
     * 
     * @param eventType Type of event to listen to. Refer to `SnoopBotEventType` for type of supported events.
     * @param event Class that extends `SnoopBotEvent`, its method `SnoopBotEvent::onEvent()` will be executed when the event it's binded to is triggered.
     * @returns void
     */
    public on(eventType: SnoopBotEventType, event: SnoopBotEvent) : void {
        if(this.events[eventType] !== undefined) {
            Logger.error(`The event ${eventType} is already being listened to!`)
            return
        }

        this.events[eventType] = event
    }

    /**
     * Initializes SnoopBot and
     * logs in to facebook using the provided appstate
     * in the environment variable.
     * 
     * @param options Options for SnoopBot. See `SnoopBotOptions` for supported options.
     */
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

                    if(event.type === 'event') {
                        let thread = await api.getThreadInfo(event.threadID)
                        let eventType = event.logMessageType

                        switch(eventType) {
                            // Member joined a group chat
                            case 'log:subscribe':
                                // Do nothing if the thread isn't a group chat
                                if(!thread.isGroup) break

                                // Execute the callback if it exists in the events array
                                if(this.events['gc:member_join'] !== undefined)
                                    this.queue.enqueue(async() => await this.events['gc:member_join'].onEvent(event, api))
                            break

                            // Member left a group chat
                            case 'log:unsubscribe':
                                // Do nothing if the thread isn't a group chat
                                if(!thread.isGroup) break

                                // Execute the callback if it exists in the events array
                                if(this.events['gc:member_leave'] !== undefined)
                                    this.queue.enqueue(async() => await this.events['gc:member_leave'].onEvent(event, api))
                            break

                            // A group chat changed name
                            case 'log:thread-name':
                                // Do nothing if the thread isn't a group chat
                                if(!thread.isGroup) break

                                // Execute the callback if it exists in the events array
                                if(this.events['gc:change_name'] !== undefined)
                                    this.queue.enqueue(async() => await this.events['gc:change_name'].onEvent(event, api))
                            break
                            
                            // A group chat changed icon
                            case 'log:thread-icon':
                                // Do nothing if the thread isn't a group chat
                                if(!thread.isGroup) break

                                // Execute the callback if it exists in the events array
                                if(this.events['gc:change_icon'] !== undefined)
                                    this.queue.enqueue(async() => await this.events['gc:change_icon'].onEvent(event, api))
                            break

                            // A group chat changed theme
                            case 'log:thread-color':
                                // Do nothing if the thread isn't a group chat
                                if(!thread.isGroup) break

                                // Execute the callback if it exists in the events array
                                if(this.events['gc:change_theme'] !== undefined)
                                    this.queue.enqueue(async() => await this.events['gc:change_theme'].onEvent(event, api))
                            break

                            // A user changed nickname
                            case 'log:user-nickname':
                                // Execute the callback if it exists in the events array
                                if(this.events['user:change_nickname'] !== undefined)
                                    this.queue.enqueue(async() => await this.events['user:change_nickname'].onEvent(event, api))
                            break
                        }
                    }

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