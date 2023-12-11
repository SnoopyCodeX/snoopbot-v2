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

import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotCommand } from "@snoopbot";

export default class UptimeCommand extends SnoopBotCommand {
    private SECONDS: number = 1;
    private MINUTES: number = this.SECONDS * 60;
    private HOUR: number = this.MINUTES * 60;
    private DAY: number = this.HOUR * 24;
    private MONTH: number = this.DAY * 30;
    private YEAR: number = this.MONTH * 12;
    
    constructor() {
        super({
            name: 'uptime',
            params: '^uptime',
            description: 'Shows the total time that SnoopBot has been active.',
            usage: 'uptime',
            adminOnly: true
        })
    }
    
    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras): Promise<void> {
        const elapsedTime = Math.floor(process.uptime());
        let message = "🤖SnoopBot has been up for ";

        if(elapsedTime < this.MINUTES)
            message += `${elapsedTime} seconds.`
        else if(elapsedTime >= this.MINUTES && elapsedTime < this.HOUR) {
            const minutes = Math.round(elapsedTime / this.MINUTES);
            const seconds = Math.round(elapsedTime % this.SECONDS);

            message += `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds > 1 ? "s" : ""}.` 
        } else if (elapsedTime >= this.HOUR && elapsedTime < this.DAY) {
            const hours = Math.round(elapsedTime / this.HOUR);
            const minutes = Math.round(elapsedTime % this.MINUTES);
            const seconds = Math.round(minutes % this.SECONDS);

            message += `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds > 1 ? "s" : ""}.`
        } else if (elapsedTime >= this.DAY && elapsedTime < this.MONTH) {
            const days = Math.round(elapsedTime / this.DAY);
            const hours = Math.round(elapsedTime % this.HOUR);
            const minutes = Math.round(hours % this.MINUTES);
            const seconds = Math.round(minutes % this.SECONDS);

            message += `${days} day${days > 1 ? "s" : ""} ${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds > 1 ? "s" : ""}.`
        } else if (elapsedTime >= this.MONTH && elapsedTime < this.YEAR) {
            const months = Math.round(elapsedTime / this.MONTH);
            const days = Math.round(elapsedTime % this.DAY);
            const hours = Math.round(days % this.HOUR);
            const minutes = Math.round(hours % this.MINUTES);
            const seconds = Math.round(minutes % this.SECONDS);

            message += `${months} month${months > 1 ? "s" : ""} ${days} day${days > 1 ? "s" : ""} ${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds > 1 ? "s" : ""}.`
        } else if (elapsedTime >= this.YEAR) {
            const years = Math.round(elapsedTime / this.YEAR);
            const months = Math.round(elapsedTime % this.MONTH);
            const days = Math.round(months % this.DAY);
            const hours = Math.round(days % this.HOUR);
            const minutes = Math.round(hours % this.MINUTES);
            const seconds = Math.round(minutes % this.SECONDS);

            message += `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""} ${days} day${days > 1 ? "s" : ""} ${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds > 1 ? "s" : ""}.`
        }

        api.sendMessage(message, event.threadID, event.messageID);
    }
}