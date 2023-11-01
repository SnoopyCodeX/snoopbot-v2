export default class SnoopBotCommand {
    /**
     * @property options `SnoopBotCommandOptions` the options that are specified for the command.
     */
    public options: SnoopBotCommandOptions

    /**
     * Creates a new command instance.
     * 
     * @param options `SnoopBotCommandOptions` the options that you may specify for the command.
     */
    constructor(options: SnoopBotCommandOptions) {
        this.options = options
    }

    /***
     * Executed when the command's regex pattern matches the received message.
     * 
     * @param matches An array of message pieces that matched the defined regex for the command.
     * @param event The event received. See `https://github.com/VangBanLaNhat/fca-unofficial`.
     * @param api The facebook chat api. See `https://github.com/VangBanLaNhat/fca-unofficial`.
     * @param extras `SnoopBotCommandExtras` this contains the options that are declared in the command.
     */
    public async execute(matches: Array<any>, event: any, api: any, extras: SnoopBotCommandExtras) : Promise<void> {
        throw new Error("SnoopBotCommand::execute() is unimplmented")
    }
}