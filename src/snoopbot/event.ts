import { FCAMainAPI, FCAMainEvent } from "./types/fca-types";

export default class SnoopBotEvent {
    /**
     * Creates a new event instance
     */
    public constructor()
    {}

    /**
     * Executed when the event it's binded to is triggered.
     * 
     * @param event The event received. See `https://github.com/VangBanLaNhat/fca-unofficial`.
     * @param api The facebook chat api. See `https://github.com/VangBanLaNhat/fca-unofficial`.
     */
    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        throw new Error("SnoopBotEvent::onEvent() is unimplmented")
    }
}