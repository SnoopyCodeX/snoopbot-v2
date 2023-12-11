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
        const messageID = event.messageID!;
        const threadID = event.threadID;
        const senderID = event.senderID!;
        const messages = event.messages;

        // Ignore threads that are not whitelisted
        const threadWhitelist = ThreadWhitelist.getThreadWhitelist()
        if(!threadWhitelist.threads.includes(threadID))
            return

        // Ignore if antiUnsend is disabled in this thread
        const settingsList = Settings.getSettings()
        const threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings
        if(!threadSettings.antiUnsendEnabled)
            return

        const deletedMessages = messages[messageID];

        // User unsent a normal message (meaning no attachments)
        if(deletedMessages.normal) {
            const userInfo = await api.getUserInfo(senderID);

            const mentions = [];
            for(const id in deletedMessages.mentions) {
                mentions.push({
                    id,
                    tag: deletedMessages.mentions[id]
                });
            }

            const user = userInfo[senderID];
            const message = {
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
            for(const deletedMessage of deletedMessages) {
                // If the message is a type of 'sticker'
                if(deletedMessage.type === 'sticker') {
                    shareDetected = true;

                    const userInfo = await api.getUserInfo(senderID);

                    const mentions = [];
                    for(const id in deletedMessage.mentions) {
                        mentions.push({
                            id,
                            tag: deletedMessage.mentions[id]
                        })
                    }

                    const user = userInfo[senderID];
                    const message = {
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
                        const userInfo = await api.getUserInfo(deletedMessage.target.sender.id);
                        const user = userInfo[senderID];
                        const latitude = deletedMessage.target.coordinate.latitude;
                        const longitude = deletedMessage.target.coordinate.longitude;
                        const message = {
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
                    const userInfo = await api.getUserInfo(senderID);
                    const mentions = [];

                    for(const id in deletedMessage.mentions) {
                        mentions.push({
                            id,
                            tag: deletedMessage.mentions[id]
                        });
                    }

                    const user = userInfo[senderID];
                    const message = {
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
                    const longitude = deletedMessage.longitude;
                    const latitude = deletedMessage.latitude;
                    shareDetected = true;

                    const userInfo = await api.getUserInfo(senderID);
                    const user = userInfo[senderID];
                    const message = {
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
            const mentions = [];
            const streams = [];

            for(const deletedMessage of deletedMessages) {
                const url = deletedMessage.type !== 'photo' ? deletedMessage.url : deletedMessage.largePreviewUrl;
                const downloadResult = await Downloader.downloadFile(url, false);

                if(downloadResult.hasError) {
                    Logger.error(`Downloading attachment failed, reason: ${downloadResult.message}`);
                    return;
                }

                streams.push(downloadResult.results![0]);

                for(const id in deletedMessage.mentions) {
                    mentions.push({
                        id,
                        tag: deletedMessage.mentions[id]
                    });
                }
            }

            const userInfo = await api.getUserInfo(senderID);
            const user = userInfo[senderID];
            const message = {
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