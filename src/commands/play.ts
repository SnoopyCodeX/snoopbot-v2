import { SnoopBotCommand, Downloader, Logger } from "../snoopbot";

export default class PlayCommand extends SnoopBotCommand {
    public constructor(options?: SnoopBotCommandOptions) {
        super({
            params: "^play\\s(.*)",
            name: "play",
            usage: "play <song title>",
            description: "Play a song from youtube",
            ...options
        })
    }

    public async execute(matches: any[], event: any, api: any, extras: SnoopBotCommandExtras) {
        let songTitle = matches.pop()

        api.sendMessage(`🔍Searching for "${songTitle}"...`, event.threadID, event.messageID)

        let result = await Downloader.downloadYTVideo(songTitle, "audio", !!extras.debugMode)

        if(result.hasError) {
            api.sendMessage(`⚠️ ${result.message}`, event.threadID, event.messageID)
            return
        }

        api.sendMessage(`✅ Found "${result.results![1]}", sending...`, event.threadID, event.messageID)

        let messageData = {
            body: `🎧Playing "${result.results![1]}"`,
            attachment: result.results![0]
        }

        api.sendMessage(messageData, event.threadID, event.messageID)
    }
}