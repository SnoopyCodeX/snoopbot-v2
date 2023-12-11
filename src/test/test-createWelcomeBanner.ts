import { createWriteStream, existsSync, unlink } from "fs"
import { Downloader, Logger } from "../snoopbot"
import sharp from "sharp"
import { Readable } from "stream"
import dotenv from "dotenv"
import axios from "axios"

(async () => {
    dotenv.config()
    const outputImage = `${process.cwd()}/src/snoopbot/lib/images/greetings_banner-test.png`
    const profileImage = `${process.cwd()}/src/snoopbot/lib/images/profile-pic-downloaded.png`
    const profileCircleCropped = `${process.cwd()}/src/snoopbot/lib/images/profile-cropped-circle.png`
    const overlayImage = `${process.cwd()}/src/snoopbot/lib/images/greetings_bg.jpg`
    const circleSize = 200

    const welcomeMessage = "Welcome to Programmers IT/CS/IS"
    const memberMessage = "You are the 110th member of CodeSync PH"

    const curl = `https://graph.facebook.com/100087000531483/picture?width=720&height=720&access_token=${process.env.FB_ACCESS_TOKEN}`
    const axiosR = await axios.get(curl)

    console.log(axiosR)

    // Download profile image
    Logger.muted('Downloading profile...')
    // let downloadProfileResult = await Downloader.downloadFile('https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-6/393721112_977252046678454_4664905812076049398_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeFBTzBUBqRN2QgxRX1NBcgULkmxwbtQinIuSbHBu1CKcq_9PwNH_e5gl5oqmtLTduJo0mzEOmRtHUQucdx7zbrS&_nc_ohc=3RecootO9ZsAX_QelZx&_nc_ht=scontent.fcgy2-2.fna&oh=00_AfBmF67Sk5e6UZicNx1YRCG6z8TiR3GfAr6ExQc9v0W2Uw&oe=65656EFE')
    const downloadProfileResult = await Downloader.downloadFile(curl)
    
    if(downloadProfileResult.hasError) {
        return Logger.error(downloadProfileResult.message!)
    }
    
    Logger.success('Profile image downloaded successfully!')
    const profileReadableStreamImage: Readable = downloadProfileResult.results![0]
    const profileWritableStreamImage = createWriteStream(profileImage)

    profileReadableStreamImage.pipe(profileWritableStreamImage)
    profileWritableStreamImage.on("finish", async () => {
        profileWritableStreamImage.end()
        profileReadableStreamImage.destroy()

        // Crop the profile into a cirlce and save it as a png file
        await sharp(profileImage)
            .resize(circleSize, circleSize, {fit: "cover", position: "centre"})
            .composite([
                {
                    input: Buffer.from(`<svg><circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2}" fill="white" /></svg>`),
                    blend: 'dest-in'
                }
            ])
            .toFile(profileCircleCropped)
            .catch(err => Logger.error(err));

        await sharp(overlayImage)
            .composite([
                {
                    input: profileCircleCropped,
                    top: Math.round(350 / 2) - circleSize / 2,
                    left: 35
                },
                {
                    input: Buffer.from(`<svg><text y="44" font-family="Forte" font-weight="bold" font-size="60" fill="white" text-align="center">John Roy</text></svg>`),
                    top: 120,
                    left: 250
                },
                {
                    input: Buffer.from(`<svg><text y="18" font-family="Arial" font-size="25" fill="white" text-align="center">${welcomeMessage}</text></svg>`),
                    top: 195,
                    left: 250
                },
                {
                    input: Buffer.from(`<svg><text y="14" font-family="Arial" font-size="20" fill="white" text-align="center">${memberMessage}</text></svg>`),
                    top: 250,
                    left: 250
                }
            ])
            .toFile(outputImage)
            .then(_ => Logger.success('Success fully generated a new welcome banner!'))
            .catch(err => Logger.error(`Overlaying Error: ${err}`))
    })
})()