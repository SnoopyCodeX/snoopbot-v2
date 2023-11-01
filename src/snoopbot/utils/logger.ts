import chalk from "chalk";

export default class Logger {
    constructor() {}

    public static log(message: string, mode: LoggerType = 'muted') : void {
        let logMessageTag = chalk.magentaBright('[SnoopBot]: ');
        let logMessageContent = ''

        switch(mode) {
            case 'muted':
                logMessageContent = chalk.gray(message)
                break

            case 'success':
                logMessageContent = chalk.greenBright(message)
                break

            case 'error':
                logMessageContent = chalk.redBright(message)
                break
        }

        console.log(logMessageTag + logMessageContent)
    }

    public static success(message: string) : void {
        Logger.log(message, 'success')
    }
    
    public static error(message: string) : void {
        Logger.log(message, 'error')
    }

    public static muted(message: string) : void {
        Logger.log(message, 'muted')
    }
}