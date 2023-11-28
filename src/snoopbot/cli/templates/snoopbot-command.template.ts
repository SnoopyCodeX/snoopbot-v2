import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotCommand } from "@snoopbot";

export default class <NAME> extends SnoopBotCommand {
    constructor(options?: SnoopBotCommandOptions) {
        super({
            name: '<options-NAME>',
            params: '^<options-NAME>\\s(.*)',
            description: 'My awesome command',
            usage: '<options-NAME> <args>',
            ...options
        })
    }

    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras): Promise<void> {
        // This is where you'll process the command
        api.sendMessage('This is a new command!', event.threadID);    
    }
}