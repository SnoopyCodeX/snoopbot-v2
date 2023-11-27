import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";

export default class SnoopBotMiddleware {
    /**
     * Creates a middleware instance
     */
    constructor()
    {}

    /**
     * Handles the current request
     * 
     * @param next 
     */
    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        throw new Error('SnoopBot::handle() is unimplemented!')
    }
}