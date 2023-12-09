import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { ThreadWhitelist } from "@commands/joinOrLeave";
import { Downloader, Logger, Settings, SnoopBotEvent } from "@snoopbot";

export default class MemberUnsendEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    public getEventType() : SnoopBotEventType {
        return "message:unsend"
    }

    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        let messageID = event.messageID!;
        let threadID = event.threadID;
        let senderID = event.senderID!;
        let messages = event.messages;

        // Ignore threads that are not whitelisted
        let threadWhitelist = ThreadWhitelist.getThreadWhitelist()
        if(!threadWhitelist.threads.includes(threadID))
            return

        // Ignore if antiUnsend is disabled in this thread
        let settingsList = Settings.getSettings()
        let threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings
        if(!threadSettings.antiUnsendEnabled)
            return

        let deletedMessages = messages[messageID];

        // User unsent a normal message (meaning no attachments)
        if(deletedMessages.normal) {
            let userInfo = await api.getUserInfo(senderID);

            let mentions = [];
            for(let id in deletedMessages.mentions) {
                mentions.push({
                    id,
                    tag: deletedMessages.mentions[id]
                });
            }

            let user = userInfo[senderID];
            let message = {
                body: `👀 @${user.firstName} unsent this message:\n\n${deletedMessages.message}`,
                mentions: [
                    ...mentions,
                    {
                        tag: `@${user.firstName}`,
                        id: senderID
                    }
                ]
            };

            api.sendMessage(message, threadID);
        } 
        // User unsent a message that has an attachment or is not a normal message
        else {
            // Boolean flag to check if the user unsent
            // a shared location, live location, sticker, url
            let shareDetected = false;

            // Loop through all the stored messages
            for(let deletedMessage of deletedMessages) {
                // If the message is a type of 'sticker'
                if(deletedMessage.type === 'sticker') {
                    shareDetected = true;

                    let userInfo = await api.getUserInfo(senderID);

                    let mentions = [];
                    for(let id in deletedMessage.mentions) {
                        mentions.push({
                            id,
                            tag: deletedMessage.mentions[id]
                        })
                    }

                    let user = userInfo[senderID];
                    let message = {
                        body: `👀 @${user.firstName} unsent this sticker: \n\n${deletedMessage.message || ''}`,
                        mentions: [
                            ...mentions,
                            {
                                tag: `@${user.firstName}`,
                                id: senderID
                            }
                        ]
                    }

                    api.sendMessage(message, threadID);
                    continue;
                }

                // If the message is a that contains urls or live locations
                if(deletedMessage.type === 'share') {
                    shareDetected = true;

                    // If the deleted message is a live location
                    if(deletedMessage.source === null) {
                        let userInfo = await api.getUserInfo(deletedMessage.target.sender.id);
                        let user = userInfo[senderID];
                        let latitude = deletedMessage.target.coordinate.latitude;
                        let longitude = deletedMessage.target.coordinate.longitude;
                        let message = {
                            body: `👀 @${user.firstName} unsent this live location: \n\n${deletedMessage.message || ''}`,
                            mentions: [{
                                tag: `@${user.firstName}`,
                                id: deletedMessage.target.sender.id
                            }],
                            location: {
                                latitude,
                                longitude,
                                current: false
                            }
                        };

                        api.sendMessage(message, threadID);
                        continue;
                    }

                    // For deleted messages with urls
                    let userInfo = await api.getUserInfo(senderID);
                    let mentions = [];

                    for(let id in deletedMessage.mentions) {
                        mentions.push({
                            id,
                            tag: deletedMessage.mentions[id]
                        });
                    }

                    let user = userInfo[senderID];
                    let message = {
                        body: `👀 @${user.firstName} unsent this message:\n\n${deletedMessage.message}`,
                        mentions: [
                            ...mentions,
                            {
                                tag: `@${user.firstName}`,
                                id: senderID
                            }
                        ],
                        url: deletedMessage.url
                    };

                    api.sendMessage(message, threadID);
                    continue;
                }

                // For deleted normal shared location
                if(deletedMessage.type === 'location') {
                    let longitude = deletedMessage.longitude;
                    let latitude = deletedMessage.latitude;
                    shareDetected = true;

                    let userInfo = await api.getUserInfo(senderID);
                    let user = userInfo[senderID];
                    let message = {
                        body: `👀 @${user.firstName} unsent this location: \n\n${deletedMessage.message || ''}`,
                        mentions: [{
                            tag: `@${user.firstName}`,
                            id: senderID
                        }],
                        location: {
                            latitude,
                            longitude,
                            current: false
                        }
                    };

                    api.sendMessage(message, threadID);
                    continue;
                }
            }

            // Stop here if the user just unsent a shared attachment
            if(shareDetected) {
                shareDetected = false;
                return;
            }

            // Everything below here will be for messages
            // that have attachments such as photo, video, file
            let mentions = [];
            let streams = [];

            for(let deletedMessage of deletedMessages) {
                let url = deletedMessage.type !== 'photo' ? deletedMessage.url : deletedMessage.largePreviewUrl;
                let downloadResult = await Downloader.downloadFile(url, false);

                if(downloadResult.hasError) {
                    Logger.error(`Downloading attachment failed, reason: ${downloadResult.message}`);
                    return;
                }

                streams.push(downloadResult.results![0]);

                for(let id in deletedMessage.mentions) {
                    mentions.push({
                        id,
                        tag: deletedMessage.mentions[id]
                    });
                }
            }

            let userInfo = await api.getUserInfo(senderID);
            let user = userInfo[senderID];
            let message = {
                body: `👀@${user.firstName} unsent these attachments: \n\n${deletedMessages[0].message || ''}`,
                mentions: [
                    ...mentions,
                    {
                        tag: `@${user.firstName}`,
                        id: senderID
                    }
                ],
                attachment: streams
            };

            api.sendMessage(message, threadID);
        }
    }
}