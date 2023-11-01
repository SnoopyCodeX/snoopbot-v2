import chalk from "chalk";

export default class Queue {
    private maxSimultaneously: number;
    private name: string;
    private __active: number;
    private __queue: Array<() => Promise<any>>;
    
    public constructor(maxSimultaneously: number = 1, name: string = '') {
        this.maxSimultaneously = maxSimultaneously
        this.name = name
        this.__active = 0
        this.__queue = []
    }

    public async enqueue(func: () => Promise<any>) : Promise<any> {
        if(++this.__active > this.maxSimultaneously) {
            await new Promise(resolve => this.__queue.push(async () => resolve))
        }

        try {
            console.log(chalk.blueBright(`[SnoopBot: Qeueue@${this.name}]: ${this.__active} active queues`))
            return await func()
        } catch(error: any) {
            console.log(chalk.redBright(`[SnoopBot: Queue@${this.name}]: Something went wrong, cause: ${error}`))
            throw error
        } finally {
            this.__active--;

            if(this.__queue.length)
                this.__queue.shift()!()

            console.log(chalk.cyanBright(`[SnoopBot: Queue@${this.name}]: ${this.__active} active queues`))
        }
    }
}