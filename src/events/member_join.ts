import { Settings, SnoopBotEvent } from "../snoopbot";

type MessageType = {
    body: string,
    mentions: Array<any>
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
                return `${_strNumber + _prevNumber === '1' ? 'th' : 'st'}`;

            case "2":
                return `${_strNumber + _prevNumber === '1' ? 'th' : 'nd'}`;

            case "3":
                return `${_strNumber + _prevNumber === '1' ? 'th' : 'rd'}`;

            default:
                return `${_strNumber + "th"}`;
        }
    }

    public async onEvent(event: any, api: any) {
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

                await api.changeNickname("SnoopBot", event.threadID, botID);
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
        }

        api.sendMEssage(message, event.threadID);
    }
}