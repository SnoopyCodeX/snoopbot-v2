export default class SnoopBotCommand {
    public options: SnoopBotCommandOptions

    constructor(options: SnoopBotCommandOptions) {
        this.options = options
    }

    public async execute(matches: Array<any>, event: any, api: any, extras: SnoopBotCommandExtras) : Promise<void> {
        throw new Error("SnoopBotCommand::execute() is unimplmented")
    }
}