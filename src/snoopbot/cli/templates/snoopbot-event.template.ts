import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotEvent } from "@snoopbot";

export default class <NAME> extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        // Do something...
    }
}