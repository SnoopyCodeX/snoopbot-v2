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

import dotenv from "dotenv";
import { existsSync, writeFileSync } from "fs";
import puppeteer, { Browser } from "puppeteer";

import Crypt from "../utils/crypt";
import Logger from "../utils/logger";
dotenv.config()

import { exec } from "node:child_process";
import { promisify } from "node:util";

export default class Authenticator {
    public constructor() {}

    /**
     * Creates a session file that is fetched
     * from facebook based on the provided
     * email address and password.
     * 
     * @source https://github.com/jersoncarin/fb-chat-command/blob/main/cli.js
     * @return Promise<void>
     */
    public static async authenticate(forceAuthenticate: boolean = false) : Promise<void> {
        if(existsSync(`${process.cwd()}/state.session`) && !forceAuthenticate) {
            return
        }

        if(!process.env.FB_EMAIL || !process.env.FB_PASS) {
            throw new Error("No facebook credentials were found. Please see documentation on how to configure your facebook credentials.")
        }

        const email: string = process.env.FB_EMAIL;
        const paswd: string = process.env.FB_PASS;

        return await (async () => {
            let browser: Browser|undefined;

            try {
                if(!process.env.IS_LOCAL) {
                    const { stdout: chromiumPath } = await promisify(exec)("which chromium");

                    browser = await puppeteer.launch({
                        headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'],
                        executablePath: chromiumPath.trim()
                    });
                } else {
                    browser = await puppeteer.launch({
                        headless: "new"
                    });
                }

                const page = await browser.newPage();

                Logger.muted("Parsing facebook login credentials...");

                await page.goto("https://www.facebook.com/");

                await page.waitForSelector("#email");
                await page.type("#email", email);
                await page.type("#pass", paswd);
                await page.click("button[name='login']");

                Logger.muted("Trying to authenticate...");

                await page.waitForSelector("div[role=main]");

                let cookies = await page.cookies();
                let parsedCookies = cookies.map(({name: key, ...rest}) => ({key, ...rest}));

                let cookieString = JSON.stringify(parsedCookies);

                Logger.muted("Writing session file...");

                let cryptResult = Crypt.encrypt(Buffer.from(cookieString).toString("base64"))

                if(cryptResult === 'failed') {
                    return
                }

                writeFileSync("state.session", cryptResult);

                Logger.success("Session file has been created!");
                Logger.success("Starting snoopbot...");
            } catch(error: any) {
                if(error instanceof Error) {
                    let errMessage = error.message;

                    if(errMessage.includes('div[role=main]')) {
                        Logger.error(`Invalid email address or password. If your account has 2FA enabled, please disable it. ${errMessage}`);
                    } else {
                        Logger.error("Error: " + errMessage);
                    }
                } else {
                    Logger.error("Error: " + error);
                }
            }

            if(browser !== undefined) await browser.close();
        })();
    }
}