import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotMiddleware } from "@snoopbot";

export default class <NAME> extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => {
            // Do something in here...

            await next(matches, event, api, extra);
        }
    }
}