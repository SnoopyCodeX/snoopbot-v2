import { SnoopBotCommand, Settings } from "../snoopbot";

class HelpCommand extends SnoopBotCommand {
    public constructor(options?: SnoopBotCommandOptions) {
        super({
            name: 'help',
            params: '^help\\s?(.*)?',
            usage: 'help',
            description: 'Shows a list of available commands',
            ...options
        })
    }

    public async execute(matches: any[], event: any, api: any, extras: SnoopBotCommandExtras) {
        const settings = Settings.getSettings()
        const threadSettings = settings.threads[event.threadID] || settings.defaultSettings
        const prefix = threadSettings.prefix

        let message = "📋 Available Commands\n\n"
        message += `⟩ Prefix: ${prefix}\n\n`

        extras.commands.sort((a:SnoopBotCommandOptions, b:SnoopBotCommandOptions) => a.name! > b.name! ? 1 : -1)

        // List non-admin commands
        extras.commands.forEach((command: any) => {
            if(command.adminOnly) return

            message += `${prefix + command.usage}: ${command.description}\n\n`
        })

        // List admin commands
        extras.commands.forEach((command: SnoopBotCommandOptions) => {
            if(!command.adminOnly) return

            if(!message.includes("** Admin Commands **"))
                message += "** Admin Commands **\n\n"

            message += `${prefix + command.usage!}: ${command.description}\n\n`
        })

        message += "© Made with ❣️ by John Roy🍀"
        api.sendMessage(message, event.threadID, event.messageID)
    }
}

export default HelpCommand