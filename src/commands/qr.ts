import { createReadStream, createWriteStream, existsSync, unlink } from "fs";
import { Downloader, Logger, SnoopBotCommand } from "@snoopbot";
import dotenv from 'dotenv'
import sharp from "sharp";
import { Readable } from "stream";
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
dotenv.config()

export default class QRCodeCommand extends SnoopBotCommand {
    constructor() {
        super({
            name: 'qr-code',
            params: '^qr\\-code\\s(.*)',
            usage: 'qr-code <text to encode>',
            description: 'Generates a qr code based on the text you provide'
        })
    }

    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras): Promise<void> {
        const qrCode = (await import('@shortcm/qr-image/lib/png')).default
        const { getPNG } = qrCode

        const profileCurl = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=${process.env.FB_ACCESS_TOKEN}`
        const downloadResult = await Downloader.downloadFile(profileCurl)

        if(downloadResult.hasError) {
            api.sendMessage(`⚠️Failed to download profile picture. ${downloadResult.message!}`, event.threadID, event.messageID)
            return
        }

        const text = matches[1] // text to encode
        const profilePicturePath = `${process.cwd()}/src/snoopbot/lib/images/qrcode-profile-picture-${event.senderID}.png`
        const qrCodeOutputPath = `${process.cwd()}/src/snoopbot/lib/images/qrcode-output-${event.senderID}.png`
        const profilePictureReadStream = downloadResult.results![0]
        const profilePictureWriteStream = createWriteStream(profilePicturePath)
        const circleSize = 32

        profilePictureReadStream.pipe(profilePictureWriteStream)
        profilePictureWriteStream.on("finish", async() => {
            profilePictureWriteStream.end()
            profilePictureReadStream.destroy()

            // Crop the profile into a cirlce and save it as a png file
            await sharp(profilePicturePath)
                .resize(circleSize, circleSize, {fit: "cover", position: "centre"})
                .composite([
                    {
                        input: Buffer.from(`<svg><circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2}" fill="white" /></svg>`),
                        blend: 'dest-in'
                    }
                ])
                .toBuffer()
                .then((buffer) => (async() => {
                    const pngBuffer = await getPNG(text, {
                        logo: buffer,
                        logoWidth: circleSize,
                        logoHeight: circleSize
                    })

                    const pngReadable = this.bufferToReadable(pngBuffer)
                    const pngWritable = createWriteStream(qrCodeOutputPath)

                    pngReadable.pipe(pngWritable)
                    pngWritable.on("finish", () => {
                        pngWritable.end()
                        pngReadable.destroy()

                        api.sendMessage(
                            {
                                body:`✅QR Code has been generated successfully`,
                                attachment: createReadStream(qrCodeOutputPath).on("end", async() => {
                                    if(existsSync(profilePicturePath) && existsSync(qrCodeOutputPath)) {
                                        unlink(profilePicturePath, (err) => {
                                            if(err) return Logger.error('Failed to delete ' + profilePicturePath)
                                        })

                                        unlink(qrCodeOutputPath, (err) => {
                                            if(err) return Logger.error('Failed to delete ' + qrCodeOutputPath)
                                        })
                                    }
                                })
                            },
                            event.threadID,
                            event.messageID
                        )
                    })
                })())
                .catch(err => Logger.error("Cropping to Circle Error: " + err));
        })
    }

    private bufferToReadable(buffer: Buffer) {
        const readable = new Readable({
            read() {}
        })

        readable.push(buffer)
        readable.push(null)

        return readable
    }
}