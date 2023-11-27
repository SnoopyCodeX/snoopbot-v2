import dotenv from "dotenv"
import { getType, multilineRegex, pipeline } from './utils/utils'
import global from './global'
import Settings from "./settings"
import Logger from "./utils/logger"
import Command from "./command"
import Queue from "./queue"
import Authenticator from "./auth/authenticator"
import { readFileSync, unlinkSync } from "fs"
import SnoopBotEvent from "./event"
import chalk from "chalk"
import SnoopBotMiddleware from "./middleware"
import { FCAMainAPI, FCAMainEvent } from "./types/fca-types"
import Crypt from "./utils/crypt"

const login = require('fca-unofficial')
const figlet = require('figlet')
dotenv.config()

export default class SnoopBot {
    private MAX_LOGIN_RETRY: number = 3
    private login_retry_count: number = 0

    private commands: Array<Command> = []
    private events: SnoopBotThreadEvent = {}
    private commandMiddlewares: Array<SnoopBotMiddleware> = []
    private queue: Queue = new Queue(10, "GlobalQueue")
    private messages: MessageType = {}

    private options: SnoopBotOptions = {
        configs: {},
        handleMatches: false,
        debugMode: false,

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

    private printBanner() : void {
        process.stdout.write("\u001b[2J\u001b[0;0H")

        let data = readFileSync(`${process.cwd()}/src/snoopbot/fonts/3d.flf`, "utf-8")
        figlet.parseFont("3d", data)

        console.log(chalk.blueBright(figlet.textSync("SnoopBot-v2", { font: "3d" })))
        console.log(chalk`{bold {red ====[ {blue Made by SnoopyCodeX}} {red |} {red {blue ©️ 2023} {red |} {blue v0.0.1} {red |} {blue https://github.com/SnoopyCodeX/snoopbot-v2} ]====}}`)
        console.log()
    }
    
    /**
     * Creates a new SnoopBot instance
     * and loads facebook appstate from
     * environment variables
     */
    public constructor() {}

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
    public addCommandMiddleware(...commandMiddleware: Array<SnoopBotMiddleware>) : void {
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
     * logs in to facebook using the provided email
     * and pass in the environment variable.
     * 
     * @param options Options for SnoopBot. See `SnoopBotOptions` for supported options.
     */
    public init(options: SnoopBotOptions = this.options) : void {
        this.options = {
            ...this.options,
            ...options,
        }

        this.printBanner()

        if(!!this.options.debugMode)
            Logger.muted("SnoopBot is currently running in debug mode. You may disable this in the snoopbot's options.")

        try {
            Logger.muted('Logging in...')
            
            Authenticator.authenticate(this.login_retry_count > 0).then(() => {
                const cookie = Crypt.decrypt(readFileSync(`${process.cwd()}/state.session`, "utf-8"));
                const decryptedCookie = Buffer.from(cookie, 'base64').toString('utf-8');

                login({ appState: JSON.parse(decryptedCookie) }, (error: any, api: FCAMainAPI) => {
                    if(error) {
                        Logger.error("Logging in failed, might be because the session is expired.")

                        if((this.login_retry_count + 1) > this.MAX_LOGIN_RETRY) {
                            Logger.error("Reached maximum number of retries, terminating...")
                            return
                        }
                        
                        Logger.muted("Deleting stored cookie...")
                        unlinkSync(`${process.cwd()}/session.state`)

                        Logger.muted("Trying to reauthenticate...")
                        this.login_retry_count++
                        this.init(options)

                        return
                    }
    
                    Logger.muted('Logged in successfully...')
                    Logger.success('I am up and running!🚀')
    
                    let settings = Settings.getSettings()
                    let prefix = settings.defaultSettings.prefix
                    let { configs, handleMatches, debugMode, ...apiOptions } = this.options;
    
                    api.setOptions({
                        listenEvents: this.options.listenEvents,
                        selfListen: this.options.selfListen,
                        ...apiOptions,
                    })
    
                    Logger.muted('Listening for messages...')
    
                    api.listen(async (error: any, event: FCAMainEvent) => {
                        if(error) return Logger.error(`Listening failed, cause: ${error}`)

                        if(!!this.options.debugMode)
                            Logger.muted(`Event received: ${JSON.stringify(event)}`)

                        // Intercept 'message' and 'message_reply' events 
                        // as this will be used when we resend the unsent messages to the
                        // thread again.
                        if(event.type === 'message' || event.type === 'message_reply') {
                            let attachments = event.attachments!;
                            let messageID = event.messageID!;
                            let mentions = event.mentions!;
                            let message = event.body!;

                            // If there is an attachment, store it in the object as well
                            // This will be resent back to the thread
                            if(attachments.length !== 0) {
                                this.messages[messageID] = attachments;
                            }

                            // If the message body isn't empty, store the message body
                            // to the object too
                            if(message.length !== 0) {
                                if(this.messages[messageID] !== undefined) {
                                    for(let msg of this.messages[messageID]) {
                                        msg.message = message;
                                        msg.mentions = mentions;
                                    }
                                } else {
                                    this.messages[messageID] = {
                                        message,
                                        mentions,
                                        normal: true
                                    }
                                }
                            }
                        }
    
                        // Intercept events as these will be used to
                        // bind to user-defined callbacks
                        if(event.type === 'event') {
                            let thread = await api.getThreadInfo(event.threadID)
                            let eventType = event.logMessageType!
    
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

                        // If the event type is "message_unsend"
                        if(event.type === 'message_unsend') {
                            // Execute the callback if it exists in the events array
                            if(this.events['message:unsend'] !== undefined) {
                                // Include the messages object in the event object
                                event.messages = this.messages;

                                this.queue.enqueue(async() => await this.events['message:unsend'].onEvent(event, api));
                            }
                        }
    
                        settings = Settings.getSettings()
                        const threadSettings = settings.threads[event.threadID] || settings.defaultSettings
                        prefix = threadSettings.prefix

                        if(this.commands.length == 0) {
                            return Logger.error('No commands added. Please add at least 1 command')
                        }
    
                        this.commands.forEach((command) => {
                            if(command.options.name === undefined) {
                                return Logger.error('All commands must have a `name` set in its options')
                            }

                            if(command.options.params === undefined) {
                                return Logger.error('All commands must have a `params` set in its options')
                            }

                            if((getType(command.execute) === 'Function' || getType(command.execute) === 'AsyncFunction') && event.body !== undefined) {
                                const _prefix_ = event.body.substring(0, (prefix as string).length)
    
                                const commandPrefix = command.options.prefix || prefix
                                let commandBody = event.body.substring((prefix as string).length).replace(/\n/g, " ")
    
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
                                        debugMode,
                                        global
                                    }
    
                                    const commandCallback = () => async(matches: Array<any>, event: FCAMainEvent, api: FCAMainAPI, extras: any) => command.execute(matches, event, api, extras)
                                    const commandMiddlewareFuncs = this.commandMiddlewares.map((middleware) => middleware.handle)
                                    
                                    this.queue.enqueue(async () => await pipeline([...commandMiddlewareFuncs, commandCallback], matches, event, api, extras))
                                }
                            }
                        })
                    })
                })
            });
        } catch(exception: any) {
            Logger.error(`${exception}`)
        }

        process.on("uncaughtException", (error: Error) => Logger.error(`Uncaught exception, cause: ${error.message}`))
    }
}