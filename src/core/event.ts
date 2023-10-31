export default class SnoopBotEvent {
    public constructor()
    {}

    public async onEvent(event: any, api: any) {
        throw new Error("SnoopBotEvent::onEvent() is unimplmented")
    }
}