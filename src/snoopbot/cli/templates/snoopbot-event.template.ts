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
import { SnoopBotEvent } from "@snoopbot";

export default class <NAME> extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    /**
     * Returns the type of event
     * that this event handler is binded to.
     *
     * You may only bind one event handler to
     * one event type. 
     *
     * See list of event types here: 
     * https://snoopycodex.github.io/snoopbot-v2/DOCS.html#snoopbot-event-types
     *
     * @return {SnoopBotEventType}
     */
    public getEventType() : SnoopBotEventType {
        return "gc:member_join"
    }

    /**
     * Executed when the event it's binded to is triggered.
     * 
     * @param {FCAMainEvent} event The event received. See `https://github.com/VangBanLaNhat/fca-unofficial`.
     * @param {FCAMainAPI} api The facebook chat api. See `https://github.com/VangBanLaNhat/fca-unofficial`.
     */
    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        // Do something...
    }
}