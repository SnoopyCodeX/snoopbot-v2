import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { Settings, SnoopBotCommand } from "@snoopbot";
import { PermissionUtil } from "@commands/permission";

export class AdminUtils {
    constructor() {}

    public static getThreadAdmins(threadID: string) {
        const permissions = PermissionUtil.getPermissionSettings()
        const threadAdmins = permissions['thread-admins'][threadID] || []
        const botOwner = permissions['bot-owner']

        if(threadAdmins.length === 0)
            return {
                message: "This thread has no administrators for this chatbot",
                hasError: true,
                botOwner
            }

        return {
            admins: threadAdmins,
            hasError: false,
            botOwner
        }
    }

    public static addAdminsToThread(threadID: string, ...newAdmins: string[]) {
        const allThreadAdmins = PermissionUtil.getPermissionSettings()
        let alreadyAdmins = []

        if(allThreadAdmins['thread-admins'][threadID] === undefined)
            allThreadAdmins['thread-admins'][threadID] = []

        if(allThreadAdmins['thread-admins'][threadID].length > 0) {
            const admins = allThreadAdmins['thread-admins'][threadID]

            alreadyAdmins = newAdmins.filter((admin) => admins.includes(admin))

            if(alreadyAdmins.length > 0)
                return {
                    alreadyAdmins,
                    hasError: true
                }
        }

        allThreadAdmins['thread-admins'][threadID].push(...newAdmins)
        PermissionUtil.savePermissionSettings(allThreadAdmins)
        return { hasError: false }
    }

    public static removeAdminsFromThread(threadID: string, ...adminsToRemove: string[]) {
        const allThreadAdmins = PermissionUtil.getPermissionSettings()
        let notAdmins = []

        if(allThreadAdmins['thread-admins'][threadID] === undefined || allThreadAdmins['thread-admins'][threadID].length === 0)
            return {
                message: 'This thread has no administrators in this chatbot to be removed',
                hasError: true
            }

        if(allThreadAdmins['thread-admins'][threadID].length > 0) {
            const admins = allThreadAdmins['thread-admins'][threadID]

            notAdmins = adminsToRemove.filter((admin) => !admins.includes(admin))

            if(notAdmins.length > 0)
                return {
                    notAdmins,
                    hasError: true
                }
        }

        const admins = allThreadAdmins['thread-admins'][threadID]
        adminsToRemove.forEach((admin) => admins.splice(admins.indexOf(admin), 1))
        allThreadAdmins['thread-admins'][threadID] = admins

        if(allThreadAdmins['thread-admins'][threadID].length === 0)
            delete allThreadAdmins['thread-admins'][threadID]

        PermissionUtil.savePermissionSettings(allThreadAdmins)
        return { hasError: false }
    }

    public static listAdminsInThread(threadID: string) {
        const allThreadAdmins = PermissionUtil.getPermissionSettings()
        const admins = allThreadAdmins['thread-admins'][threadID]

        if(admins === undefined || admins.length === 0)
            return {
                message: 'This thread has no administrators for this chatbot',
                hasError: true
            }

        return {
            admins,
            hasError: false
        }
    }
}

export default class AdminCommand extends SnoopBotCommand {
    constructor() {
        super({
            name: 'admin',
            params: '^admin\\s(promote|demote|list)\\s?(.*)?',
            usage: 'admin <promote|demote|list> <@you | @person1, @person2, ...>',
            description: 'Promote/Demote/List admins of this chatbot',
            hasArgs: true,
            adminOnly: true
        })
    }

    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras): Promise<void> {
        const settingsList = Settings.getSettings()
        const threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings
        const adminWhitelist = AdminUtils.getThreadAdmins(event.threadID)
        const admins = adminWhitelist.hasError ? [] : adminWhitelist.admins!

        const action = (matches[1] as string) // promote/demote/list
        const person = (matches[2] as string) // @you
        const mentions = event.mentions

        // Promoting/Demoting user by replying to his/her message
        // The command: /admin (promote|demote) @you
        if(event.type === 'message_reply' && (action === 'promote' || action === 'demote')) {
            const userReplyID = event.messageReply!.senderID
            const botID = await api.getCurrentUserID()
            const user = (await api.getUserInfo(userReplyID))[userReplyID]

            // If admin wants to promote/demote bot owner or the bot iself
            if(userReplyID === botID || userReplyID === adminWhitelist.botOwner) {
                api.sendMessage(
                    {
                        body: `⚠️You are not allowed to promote or demote @${user.name}!`,
                        mentions: [{
                            id: userReplyID,
                            tag: `@${user.name}`
                        }]
                    }, 
                    event.threadID, 
                    event.messageID
                )

                return
            }

            // If admin did not specifically typed @you
            if(person !== "@you") {
                api.sendMessage(
                    {
                        body: `⚠️To ${action} @${user.name} ${action === 'promote' ? 'to' : 'from being'} an administrator of this chatbot in this thread, please reply this command:\n\n${threadSettings.prefix}admin ${action} @you\n\n-to ${user.gender === 2 ? 'his' : 'her'} message.`,
                        mentions: [{
                            id: userReplyID,
                            tag: `@${user.name}`
                        }]
                    },
                    event.threadID,
                    event.messageID
                )

                return
            }

            // If user to promote is already an admin
            if(admins.includes(userReplyID) && action === 'promote') {
                api.sendMessage(
                    {
                        body: `⚠️Promotion failed, @${user.name} is already an administrator of this bot in this thread!`,
                        mentions: [{
                            id: userReplyID,
                            tag: `@${user.name}`
                        }]
                    },
                    event.threadID,
                    event.messageID 
                )

                return
            }

            // If user to demote is not an admin
            if(!admins.includes(userReplyID) && action === 'demote') {
                api.sendMessage(
                    {
                        body: `⚠️Demotion failed, @${user.name} is not an administrator of this bot in this thread!`,
                        mentions: [{
                            id: userReplyID,
                            tag: `@${user.name}`
                        }]
                    },
                    event.threadID,
                    event.messageID
                )

                return
            }

            // If action is to promote the user
            if(action === 'promote')
                AdminUtils.addAdminsToThread(event.threadID, userReplyID)

            // If action is to demote the user
            if(action  === 'demote')
                AdminUtils.removeAdminsFromThread(event.threadID, userReplyID)

            api.sendMessage(
                {
                    body: `@${user.name} has been ${action}d ${action === 'promote' ? 'as' : 'from being'} an administrator of this chatbot in this thread!`,
                    mentions: [{
                        id: userReplyID,
                        tag: `@${user.name}`
                    }]
                },
                event.threadID,
                event.messageID
            )

            return
        }

        // If action is to list all bot administrators of this bot in the current thread
        if(action === 'list') {
            if(person !== undefined) {
                api.sendMessage("⚠️You do not need to specify any users when using this command!", event.threadID, event.messageID)
                return
            }

            if(adminWhitelist.hasError) {
                api.sendMessage(`⚠️ ${adminWhitelist.message!}`, event.threadID, event.messageID)
                return
            }

            let message = "Current chatbot administrators in this thread:\n\n"
            const adminInfos = await api.getUserInfo(admins)
            const mentions = []

            for(const admin in adminInfos) {
                const userInfo = adminInfos[admin]
                message += `@${userInfo.name}\n`

                mentions.push({
                    id: admin,
                    tag: `@${userInfo.name}`,
                    fromIndex: message.lastIndexOf(`@${userInfo.name}`)
                })
            }

            api.sendMessage({
                body: message,
                mentions
            }, event.threadID, event.messageID)

            return
        }

        await this.promoteOrDemote(matches, event, api, extras);
    }

    private async promoteOrDemote(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras) {
        const settingsList = Settings.getSettings()
        const threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings
        const adminWhitelist = AdminUtils.getThreadAdmins(event.threadID)
        const admins = adminWhitelist.hasError ? [] : adminWhitelist.admins!
        const action = (matches[1] as string)
        const person = (matches[2] as string)
        const mentions = event.mentions!

        // If admin did not mentioned any users
        if(Object.entries(mentions).length === 0) {
            api.sendMessage(
                `⚠️You have not mentioned any users to ${action} ${action === 'promote' ? 'as' : 'from being'} an administrator of this chatbot in this thread!`,
                event.threadID,
                event.messageID
            )

            return
        }

        // Get user ids of mentioned users
        const mentionedIds = []
        for(const mentionedID in mentions)
            mentionedIds.push(mentionedID)

        // Promote or demote mentioned users
        let result: any|undefined = undefined
        if(action === 'promote')
            result = AdminUtils.addAdminsToThread(event.threadID, ...mentionedIds)

        if(action === 'demote')
            result = AdminUtils.removeAdminsFromThread(event.threadID, ...mentionedIds)

        // If promoting/demoting succeeded
        if(result !== undefined && !result.hasError) {
            let message = `Successfully ${action}d `
            const toBeMentioned = []

            for(const mentionedID in mentions) {
                message += `${mentions[mentionedID]} `
                toBeMentioned.push({
                    id: mentionedID,
                    tag: mentions[mentionedID],
                    fromIndex: message.lastIndexOf(mentions[mentionedID])
                })
            }

            message += `${action === 'promote' ? 'as' : 'from being'} an administrator of this chatbot in this thread!`
            api.sendMessage({
                body: message,
                mentions: toBeMentioned
            }, event.threadID, event.messageID)

            return
        }

        // If Promoting/Demoting failed
        if(result !== undefined && result.hasError) {
            const userIDs = result.alreadyAdmins || result.notAdmins
            let message = `⚠️ ${action === "promote" ? "Promotion" : "Demotion"} failed, `
            const toBeMentioned = []
            
            for(const userID of userIDs) {
                message += `${mentions[userID]} `
                toBeMentioned.push({
                    id: userID,
                    tag: mentions[userID],
                    fromIndex: message.lastIndexOf(mentions[userID])
                })
            }
            
            const isOrAre = userIDs.length > 1 ? "are" : "is"
            const alreadyOrNot = action === "promote" ? "already" : "not"
            message += `${isOrAre} ${alreadyOrNot} an administrator of this chatbot!`
            
            api.sendMessage({
                body: message,
                mentions: toBeMentioned
            }, event.threadID, event.messageID)
            
            return
        }

        // If an unknown action is executed
        api.sendMessage(`⚠️Unknown action: ${action}\n\nUsage: ${threadSettings.prefix + extras.usage!}`, event.threadID, event.messageID)
    }
}