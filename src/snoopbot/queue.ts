/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2023, SnoopyCodeX
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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