import google from "googlethis";
import { ReadableStream } from "stream/web";
import { Downloader, SnoopBotCommand } from "../snoopbot";

export default class ReverseImageSearchCommand extends SnoopBotCommand {
    constructor(options?: SnoopBotCommandOptions) {
        super({
            params: "^reverse\\-image\\-search(.*)?",
            usage: "reverse-image-search <optional: url of image>",
            description: "Performs a reverse image search of the provided image url or the replied image",
            name: "reverse-image-search",
            ...options
        })
    }

    public async execute(matches: any[], event: any, api: any, extras: SnoopBotCommandExtras) {
        let imageUrl = matches.pop()
        let eventType = event.type

        if(eventType == 'message_reply') {
            // If the user still specified an image url, inform the user
            if(imageUrl != null || imageUrl != undefined) {
                api.sendMessage("⚠️Image url is no longer needed if you replied this command to an image", event.threadID, event.messageID)
                return
            }

            await this._doReverseImageSearchOnRepliedImage(event.messageReply, event, api, !!extras.debugMode)
        } else {
            // If the user did not specified an image url, inform the user
            if(imageUrl === null || imageUrl === undefined) {
                api.sendMessage("⚠️Image url is required if you did not replied this command to an image!", event.threadID, event.messageID)
                return
            }

            // If the provided url is invalid
            if(!imageUrl.startsWith("https://") || !imageUrl.startsWith("http://")) {
                api.sendMessage("⚠️The provided url is invalid. Please provide a valid image url!", event.threadID, event.messageID)
                return 
            }

            await this._doReverseImageSearch(imageUrl.trimStart(), event, api, !!extras.debugMode)
        }
    }

    private async _doReverseImageSearchOnRepliedImage(messageBody: any, event: any, api: any, debugMode: boolean) {
        let attachments = messageBody.attachments

        if(attachments.length === 0) {
            api.sendMessage("⚠️Please reply this command to an image", event.threadID, event.messageID)
            return
        }

        if(attachments.length > 1) {
            api.sendMessage("⚠️Please reply to a message with only 1 image", event.threadID, event.messageID)
            return
        }

        if(attachments[0].type !== "photo") {
            api.sendMessage("⚠️Please reply this command to an image attachment", event.threadID, event.messageID)
            return
        }

        let imageUrl = attachments[0].largePreviewUrl
        await this._doReverseImageSearch(imageUrl, event, api, debugMode)
    }

    private async _doReverseImageSearch(imageUrl: string, event: any, api: any, debugMode: boolean) {
        let downloadImageResult = await Downloader.downloadFile(imageUrl, debugMode)

        if(downloadImageResult.hasError) {
            api.sendMessage(`⚠️Failed to download the image. Cause: ${downloadImageResult.message}`, event.threadID, event.messageID)
            return
        }

        let downloadedImageStream = downloadImageResult.results![0]
        let bufferImage = await this._streamToBuffer(downloadedImageStream)
        let risResult = await google.search(bufferImage, {ris: true})

        if(risResult.results.length === 0) {
            api.sendMessage("⚠️Reverse image search did not find anything on the web regarding this image", event.threadID, event.messageID)
            return
        }

        let messageResultBody = `✅Found ${risResult.results.length} result${risResult.results.length > 1 ? 's' : ''}:\n\n`

        risResult.results.forEach((result, index) => {
            let title = result.title
            let description = result.description
            let url = result.url

            messageResultBody += `${index + 1}. ${title}\n${description}\n\n${url}\n\n`
        })

        messageResultBody = messageResultBody.substring(0, messageResultBody.length - 4)
        api.sendMessage(messageResultBody, event.threadID, event.messageID)
    }

    private async _streamToBuffer(stream: ReadableStream<Uint8Array>) : Promise<Buffer> {
        const buffers = []

        for await (const data of stream) {
            buffers.push(data)
        }

        return Buffer.concat(buffers)
    }
}