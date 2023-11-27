import { Downloader, Logger, Settings, SnoopBotEvent } from "../snoopbot";
import sharp from "sharp"
import dotenv from "dotenv"
import { Readable } from "stream";
import { createReadStream, createWriteStream, existsSync, unlink } from "fs";
import { ThreadWhitelist } from "../commands/joinOrLeave";
import { FCAMainAPI, FCAMainEvent } from "snoopbot/types/fca-types";
dotenv.config()

type MessageType = {
    body: string,
    mentions: Array<any>,
    attachment?: Array<any>
}

export default class MemberJoinEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    private toOrdinalNumber(number: Number): string {
        let _strNumber = `${number}`;
        let _prevNumber = _strNumber.split("")[_strNumber.length - 2];
        let _lastNumber = _strNumber.split("")[_strNumber.length - 1];

        switch(_lastNumber) {
            case "1":
                return `${_strNumber + (_prevNumber === '1' ? 'th' : 'st')}`;

            case "2":
                return `${_strNumber + (_prevNumber === '1' ? 'th' : 'nd')}`;

            case "3":
                return `${_strNumber + (_prevNumber === '1' ? 'th' : 'rd')}`;

            default:
                return `${_strNumber + "th"}`;
        }
    }

    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        // Ignore threads that are not whitelisted
        let threadWhitelist = ThreadWhitelist.getThreadWhitelist()
        if(!threadWhitelist.threads.includes(event.threadID))
            return

        let thread = await api.getThreadInfo(event.threadID);

        let settingsList = Settings.getSettings();
        if(settingsList.threads[event.threadID] === undefined)
            settingsList.threads[event.threadID] = settingsList.defaultSettings;
        Settings.saveSettings(settingsList);

        let threadSettings = settingsList.threads[event.threadID];
        let threadName = thread.threadName;
        let participants = thread.userInfo;
        let addedParticipants = event.logMessageData.addedParticipants;
        let botID = await api.getCurrentUserID();
        let message: MessageType = {
            body: "",
            mentions: []
        };

        for(let newParticipant of addedParticipants) {
            if(newParticipant.userFbId == botID) {
                message.body = `Hi, I am SnoopBot. Thank you for having me as the ${this.toOrdinalNumber(participants.length)} member of "${threadName}.\n\n"`;
                message.body += `Type ${threadSettings.prefix}help to see the list of available commands. Please remember to not spam the bot to avaoid this bot from being muted by facebook. Thank you for your kind understanding! <3\n\n~Author: @John Roy Lapida Calimlim`;
                message.mentions.push({
                    tag: "@John Roy Lapida Calimlim",
                    id: "100031810042802"
                });

                await api.changeNickname("🤖SnoopBot", event.threadID, botID);
                break;
            }
    
            if(!threadSettings.autoGreetEnabled)
                return;
    
            let firstName = newParticipant.firstName;
            let id = newParticipant.userFbId;

            message.body = `Welcome @${firstName}, you are the ${this.toOrdinalNumber(participants.length)} member of ${threadName}! Please follow the rules and regulation of this group, respect all members and admins.\n\nWe hope that we'll know about you better and we'd have a great friendship ahead. <3`;
            message.mentions.push({
                id,
                tag: `@${firstName}`
            });

            try {
                let profileUrl = `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=${process.env.FB_ACCESS_TOKEN}`
                Logger.success(`Downloading ${profileUrl}`)

                await this.createBanner(firstName, threadName, profileUrl, participants.length, (banner: string) => (async() => {
                    if(banner.indexOf('failed:') !== -1) {
                        api.sendMessage('⚠️Failed to download profile url. Reason: ' + banner.split(':')[1], event.threadID)
                        return
                    }
                    
                    message.attachment = [
                        createReadStream(banner).on("end", async() => {
                            if(existsSync(banner)) {
                                unlink(banner, error => {
                                    if(error) return Logger.error('An error occured while deleting the generated banner: ' + banner)
                                    Logger.muted('Deleted generated banner: ' + banner)
                                })
                            }
                        })
                    ]
    
                    await api.sendMessage(message, event.threadID);
                })());
            } catch(e) {
                Logger.error('An error occured: ' + e)
            }
        }
    }

    private async createBanner(participant_name: string, thread_name: string, profile_url: string, participants_number: number, callback: Function) : Promise<void> {
        try {
            let outputImage = `${process.cwd()}/src/snoopbot/lib/images/greetings_banner-${participant_name}-${participants_number}.png`
            let profileImage = `${process.cwd()}/src/snoopbot/lib/images/profile-pic-downloaded-${participant_name}-${participants_number}.png`
            let profileCircleCropped = `${process.cwd()}/src/snoopbot/lib/images/profile-cropped-circle-${participant_name}-${participants_number}.png`
            let overlayImage = `${process.cwd()}/src/snoopbot/lib/images/greetings_bg.jpg`
            let circleSize = 200

            let welcomeMessage = `Welcome to ${thread_name}`
            let memberMessage = `You are the ${this.toOrdinalNumber(participants_number)} member of ${thread_name}`

            // Download profile image
            Logger.muted('Downloading profile...')
            let downloadProfileResult = await Downloader.downloadFile(profile_url)
            
            if(downloadProfileResult.hasError) {
                Logger.error("Profile download failed: " + downloadProfileResult.message!)
                callback("failed:" + downloadProfileResult.message!)
            }
            
            Logger.success('Profile image downloaded successfully!')
            let profileReadableStreamImage: Readable = downloadProfileResult.results![0]
            let profileWritableStreamImage = createWriteStream(profileImage)

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
                    .catch(err => Logger.error("Cropping to Circle Error: " + err));

                // Put everything together
                await sharp(overlayImage)
                    .composite([
                        {
                            input: profileCircleCropped,
                            top: Math.round(350 / 2) - circleSize / 2,
                            left: 35
                        },
                        {
                            input: Buffer.from(`<svg><text y="44" font-family="Forte" font-weight="bold" font-size="60" fill="white" text-align="center">${participant_name}</text></svg>`),
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
                    .then(_ => {
                        if(existsSync(profileImage) && existsSync(profileCircleCropped)) {
                            unlink(profileImage, (err) => {
                                if(err) return Logger.error('Overlaying error: Failed to delete ' + profileImage)
                            })

                            unlink(profileCircleCropped, (err) => {
                                if(err) return Logger.error('Overlaying error: Failed to delete ' + profileCircleCropped)
                            })
                        }

                        Logger.success('Successfully generated a new welcome banner!')
                        callback(outputImage)
                    })
                    .catch(err => Logger.error(`Overlaying Error: ${err}`))
            })
        } catch(e) {
            Logger.error('An error occured in createBanner(): ' + e)
            callback('failed:' + e)
        }
    }
}