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
    public handle(next: (matches: any[], event: any, api: any, extra: SnoopBotCommandExtras) => Promise<any>) {}
}