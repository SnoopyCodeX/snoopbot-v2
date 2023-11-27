import { FCAMainAPI, FCAMainEvent } from "snoopbot/types/fca-types";
import { ThreadWhitelist } from "../commands/joinOrLeave";
import { Settings, SnoopBotEvent } from "../snoopbot";

type MessageType = {
    body: string,
    mentions: Array<any>
}
export default class MemberLeaveEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
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
        let leftParticipantFbId = event.logMessageData.leftParticipantFbId;
        let snoopbotFbId = await api.getCurrentUserID();
        let message: MessageType = {
            mentions: [],
            body: ""
        };

        // If the participant that left is the bot itself, ignore.
        if(leftParticipantFbId == snoopbotFbId)
            return;

        // Don't greet if auto greet is disabled in this thread's settings
        if(!threadSettings.autoGreetEnabled)
            return;

        let user = await api.getUserInfo(leftParticipantFbId);
        let name = user[leftParticipantFbId].name;
        message.body = `Farewell @${name}, the whole ${threadName} will be awaiting for your return!\n\nGoodbye for now and may you have a blessed day ahead! <3`;
        message.mentions.push({
            id: leftParticipantFbId,
            tag: `@${name}`
        });

        // Send the message
        api.sendMessage(message, event.threadID);
    }
}