import { readFileSync, writeFileSync } from "fs";
import { Settings, SnoopBotCommand } from "../snoopbot";

class ThreadWhitelist {
    constructor() {}

    public static getThreadWhitelist() {
        return JSON.parse(readFileSync(`${process.cwd()}/src/snoopbot/libs/thread-whitelist.json`, {encoding: 'utf-8'}));
    }

    public static saveThreadWhitelist(newThreadWhitelist: any) {
        writeFileSync(`${process.cwd()}/src/snoopbot/libs/thread-whitelist.json`, JSON.stringify(newThreadWhitelist, undefined, 4), {encoding: 'utf-8'});
    }

    public static isThreadWhitelisted(threadID: string): boolean {
        return ThreadWhitelist.getThreadWhitelist().threads.includes(threadID);
    }
}

export default class JoinOrLeaveCommand extends SnoopBotCommand {
    constructor(options?: SnoopBotCommandOptions) {
        super({
            name: "join_or_leave",
            params: "^(join|leave)",
            usage: "<join|leave>",
            description: "Allows snoopbot to respond or ignore a thread",
            ...options
        });
    }

    public async execute(matches: any[], event: any, api: any, extras: SnoopBotCommandExtras) {
        let action = matches[0]; // join | leave

        switch(action) {
            case "join":
                this.join(event, api);
                break;

            case "leave":
                this.leave(event, api);
                break;
        }
    }

    private join(event: any, api: any) {
        let settingsList = Settings.getSettings();
        let threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings;

        let threadWhitelist = ThreadWhitelist.getThreadWhitelist();
        let justJoined = false;

        if(!ThreadWhitelist.isThreadWhitelisted(event.threadID)) {
            threadWhitelist.threads.push(event.threadID);
            ThreadWhitelist.saveThreadWhitelist(threadWhitelist);

            justJoined = true;
        }

        let msg = justJoined 
            ? `🎉 SnoopBot joined the conversation!\nType ${threadSettings.prefix}help — to see the list of available commands!`
            : "🚧 SnoopBot is already in this conversation.";

        api.sendMessage(msg, event.threadID, event.messageID);
    }

    private leave(event: any, api: any) {
        let settingsList = Settings.getSettings();
        let threadSettings = settingsList.threads[event.threadID] || settingsList.defaultSettings;

        let threadWhitelist = ThreadWhitelist.getThreadWhitelist();
        let justLeft = false;

        if(ThreadWhitelist.isThreadWhitelisted(event.threadID)) {
            threadWhitelist.threads = threadWhitelist.threads.filter((threadID: string) => event.threadID !== threadID);
            ThreadWhitelist.saveThreadWhitelist(threadWhitelist);

            justLeft = true;
        }

        let msg = justLeft 
            ? `🚨 SnoopBot has left the conversation!\nType ${threadSettings.prefix}join — to add the bot back again!`
            : "🚧 SnoopBot is not in this conversation.";
            
        api.sendMessage(msg, event.threadID, event.messageID);
    }
}