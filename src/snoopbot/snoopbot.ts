/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2023, SnoopyCodeX
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import Authenticator from "@snoopbot/auth/authenticator"
import SnoopBotCommand from "@snoopbot/command"
import SnoopBotEvent from "@snoopbot/event"
import global from '@snoopbot/global'
import "@snoopbot/keep-alive"
import SnoopBotMiddleware from "@snoopbot/middleware"
import Queue from "@snoopbot/queue"
import Settings from "@snoopbot/settings"
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types"
import Crypt from "@snoopbot/utils/crypt"
import Logger from "@snoopbot/utils/logger"
import { getType, multilineRegex, pipeline } from '@snoopbot/utils/utils'
import ansiColors from "ansi-colors"
import chalk from "chalk"
import cliProgress from "cli-progress"
import dotenv from "dotenv"
import { readFileSync, unlinkSync } from "fs"
import cron from "node-cron"

const login = require('fca-unofficial')
const figlet = require('figlet')
dotenv.config()

export default class SnoopBot {
    private MAX_LOGIN_RETRY: number = 3
    private login_retry_count: number = 0

    private commands: Array<SnoopBotCommand> = []
    private events: SnoopBotThreadEvent = {}
    private commandMiddlewares: Array<SnoopBotMiddleware> = []
    private queue: Queue = new Queue(10, "GlobalQueue")
    private messages: MessageType = {}

    private options: SnoopBotOptions = {
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

        const data = readFileSync(`${process.cwd()}/src/snoopbot/fonts/3d.flf`, "utf-8")
        figlet.parseFont("3d", data)

        console.log(chalk.blueBright(figlet.textSync("SnoopBot-v2", { font: "3d" })))
        console.log(chalk`{bold {red ====[ {blue Made by SnoopyCodeX}} {red |} {red {blue ©️ 2023} {red |} {blue v0.0.1} {red |} {blue https://github.com/SnoopyCodeX/snoopbot-v2} ]====}}`)
        console.log()
    }

    private async dynamicImport(path: string) {
        const module = await import(path);
        return module;
    }
    
    private async importAllCommands() : Promise<void> {
        const commandsModule = await this.dynamicImport("@commands")
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

        if(Object.entries(commandsModule).length === 0) {
            Logger.error("No commands to import. To make one, please refer to the docs here https://snoopycodex.github.io/snoopbot-v2/DOCS.html")
            Logger.error("Terminating self...")
            process.exit(134)
        }

        const progress = new cliProgress.SingleBar({
            format: ansiColors.magentaBright('[SnoopBot]: ') + ansiColors.yellowBright('Import progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'),
            hideCursor: true,
            forceRedraw: true,
            clearOnComplete: true
        }, cliProgress.Presets.rect)
        progress.start(Object.entries(commandsModule).length, 0)
        
        for(const commandClass in commandsModule) {
            const CommandClass = commandsModule[commandClass]

            if(CommandClass.prototype instanceof SnoopBotCommand) {
                const instance = new CommandClass()
                this.commands.push(instance)
            } else {
                Logger.error(`Class ${commandClass} does not extend SnoopBotCommand class. This class will be ignored and not added.`)
            }

            progress.increment(1)
            await delay(600)
        }

        progress.stop()
    }

    private async importAllEvents() : Promise<void> {
        const eventsModule = await this.dynamicImport("@events")
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

        if(Object.entries(eventsModule).length === 0) {
            Logger.warn("No events to import. To make one, please refer to the docs here https://snoopycodex.github.io/snoopbot-v2/DOCS.html")
            return
        }

        const progress = new cliProgress.SingleBar({
            format: ansiColors.magentaBright('[SnoopBot]: ') + ansiColors.yellowBright('Import progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'),
            hideCursor: true,
            forceRedraw: true,
            clearOnComplete: true
        }, cliProgress.Presets.rect)
        progress.start(Object.entries(eventsModule).length, 0)

        for(const eventClass in eventsModule) {
            const EventClass = eventsModule[eventClass]

            if(EventClass.prototype instanceof SnoopBotEvent) {
                const instance = new EventClass()
                
                if(this.events[instance.getEventType()] !== undefined) 
                    this.events[instance.getEventType()].push(instance);
                else 
                    this.events[instance.getEventType()] = [
                        instance
                    ];
            } else {
                Logger.error(`Class ${eventClass} does not extend SnoopBotEvent class. This class will be ignored and not added.`)
            }

            progress.increment(1)
            await delay(600)
        }

        progress.stop()
    }

    private async importAllMiddlewares() : Promise<void> {
        const middlewaresModule = await this.dynamicImport("@middlewares")
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

        if(Object.entries(middlewaresModule).length === 0) {
            Logger.warn("No middlewares to import. To make one, please refer to the docs here https://snoopycodex.github.io/snoopbot-v2/DOCS.html")
            return
        }

        const progress = new cliProgress.SingleBar({
            format: ansiColors.magentaBright('[SnoopBot]: ') + ansiColors.yellowBright('Import progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'),
            hideCursor: true,
            forceRedraw: true,
            clearOnComplete: true
        }, cliProgress.Presets.rect)
        progress.start(Object.entries(middlewaresModule).length, 0)

        for(const middlewareClass in middlewaresModule) {
            const MiddlewareClass = middlewaresModule[middlewareClass]

            if(MiddlewareClass.prototype instanceof SnoopBotMiddleware) {
                const instance = new MiddlewareClass()

                if(instance.getPriority() >= 1)
                    this.commandMiddlewares.push(instance)
                else 
                    Logger.error(`Class ${middlewareClass} does not have a valid priority number. The range must be >= to 1 and not < 1. This middleware will be ignored and not added.`)
            } else {
                Logger.error(`Class ${middlewareClass} does not extend SnoopBotMiddleware class. This class will be ignored.`)
            }

            progress.increment(1)
            await delay(600)
        }

        // If we have middlewares, sort it in ascending order based on their priority
        if(this.commandMiddlewares.length > 0)
            this.commandMiddlewares = this.commandMiddlewares.sort((a, b) => a.getPriority() - b.getPriority())

        progress.stop()
    }

    /**
     * Creates a new SnoopBot instance
     * and loads facebook appstate from
     * environment variables
     */
    public constructor() {}

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

        if(this.options.debugMode)
            Logger.muted("SnoopBot is currently running in debug mode. You may disable this in the snoopbot's options.")

        try {
            Logger.muted('Logging in...')
            
            Authenticator.authenticate(this.login_retry_count > 0).then(async () => {
                const cookie = Crypt.decrypt(readFileSync(`${process.cwd()}/state.session`, "utf-8"));
                const decryptedCookie = Buffer.from(cookie, 'base64').toString('utf-8');

                Logger.muted("Importing all commands...");
                await this.importAllCommands();

                Logger.muted("Importing all events...");
                await this.importAllEvents();

                Logger.muted("Importing all middlewares...");
                await this.importAllMiddlewares();

                login({ appState: JSON.parse(decryptedCookie) }, (error: any, api: FCAMainAPI) => {
                    if(error) {
                        Logger.error("Logging in failed, might be because the session is expired.")

                        if((this.login_retry_count + 1) > this.MAX_LOGIN_RETRY) {
                            Logger.error("Reached maximum number of retries, terminating...")
                            return
                        }
                        
                        Logger.muted("Deleting stored cookie...")
                        unlinkSync(`${process.cwd()}/state.session`)

                        Logger.muted("Trying to reauthenticate...")
                        this.login_retry_count++
                        this.init(options)

                        return
                    }
    
                    Logger.muted('Logged in successfully...')
                    Logger.success('I am up and running!🚀')
    
                    let settings = Settings.getSettings()
                    let prefix = settings.defaultSettings.prefix
                    const { handleMatches, debugMode, ...apiOptions } = this.options;
    
                    api.setOptions({
                        listenEvents: this.options.listenEvents,
                        selfListen: this.options.selfListen,
                        ...apiOptions,
                    })
    
                    Logger.info('Listening for messages...')
    
                    api.listen(async (error: any, event: FCAMainEvent) => {
                        if(error) return Logger.error(`Listening failed, cause: ${error}`)

                        if(this.options.debugMode)
                            Logger.muted(`Event received: ${JSON.stringify(event)}`)

                        // Intercept 'message' and 'message_reply' events 
                        // as this will be used when we resend the unsent messages to the
                        // thread again.
                        if(event.type === 'message' || event.type === 'message_reply') {
                            const attachments = event.attachments!;
                            const messageID = event.messageID!;
                            const mentions = event.mentions!;
                            const message = event.body!;

                            // If there is an attachment, store it in the object as well
                            // This will be resent back to the thread
                            if(attachments.length !== 0) {
                                this.messages[messageID] = attachments;
                            }

                            // If the message body isn't empty, store the message body
                            // to the object too
                            if(message.length !== 0) {
                                if(this.messages[messageID] !== undefined) {
                                    for(const msg of this.messages[messageID]) {
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
                            const thread = await api.getThreadInfo(event.threadID)
                            const eventType = event.logMessageType!
    
                            switch(eventType) {
                                // Member joined a group chat
                                case 'log:subscribe':
                                    // Do nothing if the thread isn't a group chat
                                    if(!thread.isGroup) break
    
                                    // Execute the callback if it exists in the events array
                                    if(this.events['gc:member_join'] !== undefined)
                                        this.events['gc:member_join'].forEach((eventHandler: SnoopBotEvent) => {
                                            this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                        })
                                break
    
                                // Member left a group chat
                                case 'log:unsubscribe':
                                    // Do nothing if the thread isn't a group chat
                                    if(!thread.isGroup) break
    
                                    // Execute the callback if it exists in the events array
                                    if(this.events['gc:member_leave'] !== undefined)
                                        this.events['gc:member_leave'].forEach((eventHandler: SnoopBotEvent) => {
                                            this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                        })
                                break
    
                                // A group chat changed name
                                case 'log:thread-name':
                                    // Do nothing if the thread isn't a group chat
                                    if(!thread.isGroup) break
    
                                    // Execute the callback if it exists in the events array
                                    if(this.events['gc:change_name'] !== undefined)
                                        this.events['gc:change_name'].forEach((eventHandler: SnoopBotEvent) => {
                                            this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                        })
                                break
                                
                                // A group chat changed icon
                                case 'log:thread-icon':
                                    // Do nothing if the thread isn't a group chat
                                    if(!thread.isGroup) break
    
                                    // Execute the callback if it exists in the events array
                                    if(this.events['gc:change_icon'] !== undefined)
                                        this.events['gc:change_icon'].forEach((eventHandler: SnoopBotEvent) => {
                                            this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                        })
                                break
    
                                // A group chat changed theme
                                case 'log:thread-color':
                                    // Do nothing if the thread isn't a group chat
                                    if(!thread.isGroup) break
    
                                    // Execute the callback if it exists in the events array
                                    if(this.events['gc:change_theme'] !== undefined)
                                        this.events['gc:change_theme'].forEach((eventHandler: SnoopBotEvent) => {
                                            this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                        })
                                break
    
                                // A user changed nickname
                                case 'log:user-nickname':
                                    // Execute the callback if it exists in the events array
                                    if(this.events['user:change_nickname'] !== undefined)
                                        this.events['user:change_nickname'].forEach((eventHandler: SnoopBotEvent) => {
                                            this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                        })
                                break
                            }
                        }

                        // If the event type is "message_unsend"
                        if(event.type === 'message_unsend') {
                            // Execute the callback if it exists in the events array
                            if(this.events['message:unsend'] !== undefined) {
                                // Include the messages object in the event object
                                event.messages = this.messages;

                                this.events['message:unsend'].forEach((eventHandler: SnoopBotEvent) => {
                                    this.queue.enqueue(async() => await eventHandler.onEvent(event, api))
                                })
                            }
                        } 
                        // If the event type is "message"
                        else if(event.type === 'message') {
                            // Execute the callback if it exists in the events array
                            if(this.events['message:send'] !== undefined)
                                this.events['message:send'].forEach((eventHandler: SnoopBotEvent) => {
                                    this.queue.enqueue(async() => await eventHandler.onEvent(event, api));
                                })
                        }
    
                        settings = Settings.getSettings()
                        const threadSettings = settings.threads[event.threadID] || settings.defaultSettings
                        prefix = threadSettings.prefix
    
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
                                const commandBody = event.body.substring((prefix as string).length).replace(/\n/g, " ")
    
                                const regexp = new RegExp(command.options.params.toString(), "gim")
                                const matches = multilineRegex(regexp, commandBody)
                                const handleMatches = command.options.handleMatches === undefined
                                    ? options.handleMatches === undefined
                                        ? false
                                        : options.handleMatches
                                    : command.options.handleMatches
    
                                if((commandPrefix == _prefix_ && matches.length !== 0) || handleMatches) {
                                    const extras = {
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

                    // Every 1 hour, delete half of the entries of `this.messages` object
                    cron.schedule("0 * * * *", () => {
                        const entries = Object.entries(this.messages)
                        const half = Math.floor(entries.length / 2)

                        const remaining = Object.fromEntries(entries.slice(0, half))
                        this.messages = remaining
                    })
                })
            });
        } catch(exception: any) {
            Logger.error(`${exception}`)
        }

        process.on("uncaughtException", (error: Error) => Logger.error(`Uncaught exception, cause: ${error.message}`))
    }
}