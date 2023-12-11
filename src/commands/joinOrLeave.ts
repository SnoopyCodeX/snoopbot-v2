import { readFileSync, writeFileSync } from "fs";
import { Settings, SnoopBotCommand } from "@snoopbot";
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";

export class ThreadWhitelist {
    constructor() {}

    public static getThreadWhitelist() {
        return JSON.parse(readFileSync(`${process.cwd()}/src/snoopbot/lib/thread-whitelist.json`, {encoding: 'utf-8'}));
    }

    public static saveThreadWhitelist(newThreadWhitelist: {threads: string[]}) {
        writeFileSync(`${process.cwd()}/src/snoopbot/lib/thread-whitelist.json`, JSON.stringify(newThreadWhitelist, undefined, 4), {encoding: 'utf-8'});
    }

    public static isThreadWhitelisted(threadID: string): boolean {
        return ThreadWhitelist.getThreadWhitelist().threads.includes(threadID);
    }
}

export default class JoinOrLeaveCommand extends SnoopBotCommand {
    constructor() {
        super({
            name: "join_or_leave",
            params: "^(join|leave)",
            usage: "<join|leave>",
            description: "Allows snoopbot to respond or ignore a thread",
            adminOnly: true
        });
    }

    public async execute(matches: string[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras) {
        const action = matches[0]; // join | leave

        switch(action) {
            case "join":
                this.join(event, api);
                break;

            case "leave":
                this.leave(event, api);
                break;
        }
    }

    private join(event: FCAMainEvent, api: FCAMainAPI) {
        const settingsList = Settings.getSettings();
        const threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings;

        const threadWhitelist = ThreadWhitelist.getThreadWhitelist();
        let justJoined = false;

        if(!ThreadWhitelist.isThreadWhitelisted(event.threadID)) {
            threadWhitelist.threads.push(event.threadID);
            ThreadWhitelist.saveThreadWhitelist(threadWhitelist);

            justJoined = true;
        }

        const msg = justJoined 
            ? `🎉 SnoopBot joined the conversation!\nType ${threadSettings.prefix}help — to see the list of available commands!`
            : "🚧 SnoopBot is already in this conversation.";

        api.sendMessage(msg, event.threadID, event.messageID);
    }

    private leave(event: FCAMainEvent, api: FCAMainAPI) {
        const settingsList = Settings.getSettings();
        const threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings;

        const threadWhitelist = ThreadWhitelist.getThreadWhitelist();
        let justLeft = false;

        if(ThreadWhitelist.isThreadWhitelisted(event.threadID)) {
            threadWhitelist.threads = threadWhitelist.threads.filter((threadID: string) => event.threadID !== threadID);
            ThreadWhitelist.saveThreadWhitelist(threadWhitelist);

            justLeft = true;
        }

        const msg = justLeft 
            ? `🚨 SnoopBot has left the conversation!\nType ${threadSettings.prefix}join — to add the bot back again!`
            : "🚧 SnoopBot is not in this conversation.";
            
        api.sendMessage(msg, event.threadID, event.messageID);
    }
}