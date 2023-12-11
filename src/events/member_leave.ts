import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { ThreadWhitelist } from "@commands/joinOrLeave";
import { Settings, SnoopBotEvent } from "@snoopbot";

type MessageType = {
    body: string,
    mentions: Array<any>
}
export default class MemberLeaveEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    public getEventType() : SnoopBotEventType {
        return "gc:member_leave"
    }

    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        // Ignore threads that are not whitelisted
        const threadWhitelist = ThreadWhitelist.getThreadWhitelist()
        if(!threadWhitelist.threads.includes(event.threadID))
            return

        const thread = await api.getThreadInfo(event.threadID);

        const settingsList = Settings.getSettings();
        if(settingsList.threads[event.threadID] === undefined)
            settingsList.threads[event.threadID] = settingsList.defaultSettings;
        Settings.saveSettings(settingsList);

        const threadSettings = settingsList.threads[event.threadID];
        const threadName = thread.threadName;
        const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
        const snoopbotFbId = await api.getCurrentUserID();
        const message: MessageType = {
            mentions: [],
            body: ""
        };

        // If the participant that left is the bot itself, ignore.
        if(leftParticipantFbId == snoopbotFbId)
            return;

        // Don't greet if auto greet is disabled in this thread's settings
        if(!threadSettings.autoGreetEnabled)
            return;

        const user = await api.getUserInfo(leftParticipantFbId);
        const name = user[leftParticipantFbId].name;
        message.body = `Farewell @${name}, the whole ${threadName} will be awaiting for your return!\n\nGoodbye for now and may you have a blessed day ahead! <3`;
        message.mentions.push({
            id: leftParticipantFbId,
            tag: `@${name}`
        });

        // Send the message
        api.sendMessage(message, event.threadID);
    }
}