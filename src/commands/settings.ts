import { FCAMainAPI, FCAMainEvent } from "snoopbot/types/fca-types";
import { Settings, SnoopBotCommand } from "../snoopbot";

export default class SettingsCommand extends SnoopBotCommand {
    constructor(options?: SnoopBotCommandOptions) {
        super({
            name: 'settings',
            params: '^settings\\s(.*)',
            usage: 'settings <list | bot-option> <value>',
            description: 'Update/list this bot\'s settings in the current thread',
            hasArgs: true,
            ...options
        })
    }

    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras): Promise<void> {
        let settingsList = Settings.getSettings()
        let threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings
        let userSettings = (matches[1].split(" ")[0] as string)
        let option = (matches[1].split(" ")[1] as string|undefined)

        // If user wanted to list the settings
        if(userSettings === 'list') {
            if(option !== undefined) {
                api.sendMessage(
                    `⚠️Invalid use of command:\n\n${threadSettings.prefix + extras.name!} list\n\nWhen listing bot's settings, this command does not need any additional arguments.`,
                    event.threadID,
                    event.messageID
                )

                return
            }

            const thread = await api.getThreadInfo(event.threadID)
            let message = `⚙️Current settings of this SnoopBot in this thread:\n\n`
            let counter = 1

            for(let setting in threadSettings)
                message += `${counter++}. ${setting}: ${threadSettings[setting as keyof DefaultSettingsType]}\n\n`

            api.sendMessage(message, event.threadID, event.messageID)
            return
        }

        // If user wanted to update a setting of the bot
        console.log(Object.keys(threadSettings))
        console.log(userSettings)
        if(Object.keys(threadSettings).includes(userSettings)) {
            if(this.isBool(threadSettings[userSettings as keyof DefaultSettingsType]) && !this.isBool(option!)) {
                api.sendMessage(`⚠️Invalid option for '${userSettings}', option should be of type boolean(true or false)`, event.threadID, event.messageID)
                return
            } else if (this.isBool(threadSettings[userSettings as keyof DefaultSettingsType]) && this.isBool(option!)) {
                if(settingsList.threads[event.threadID] === undefined)
                    settingsList.threads[event.threadID] = threadSettings

                const key = userSettings as keyof DefaultSettingsType
                (settingsList.threads[event.threadID] as Record<typeof key, any>)[key] = this.stringToBoolean(option!)
                Settings.saveSettings(settingsList)
            } else {
                if(settingsList.threads[event.threadID] === undefined)
                    settingsList.threads[event.threadID] = threadSettings

                const key = userSettings as keyof DefaultSettingsType
                (settingsList.threads[event.threadID] as Record<typeof key, any>)[key] = option!
                Settings.saveSettings(settingsList)
            }

            api.sendMessage(`✅Snoopbot's setting for:\n\n${userSettings}\n\nhas been set to:\n\n'${option}'.`, event.threadID, event.messageID)
            return
        }
    }

    private isBool(val: string|boolean) {
        return val === "true" || val === "false" || val === false || val === true;
    }

    private stringToBoolean(val: string) {
        return val === 'true'
    }
}