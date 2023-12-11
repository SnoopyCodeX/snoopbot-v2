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

import dotenv from 'dotenv'
import Cryptr = require('cryptr');
import Logger from './logger';
dotenv.config();

export default class Crypt {
    public static encrypt(rawData: string) : string {
        if(!process.env.CRYPT_SECRET_KEY) {
            Logger.error('Encryption secret key is not set, please set it `CRYPT_SECRET_KEY=yourkey` in your .env file')
            return 'failed'
        }

        const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY, {
            encoding: 'base64',
            pbkdf2Iterations: 10000,
            saltLength: 10
        });

        return cryptr.encrypt(rawData);
    }

    public static decrypt(encryptedData: string) : string {
        if(!process.env.CRYPT_SECRET_KEY) {
            Logger.error('Encryption secret key is not set, please set it `CRYPT_SECRET_KEY=yourkey` in your .env file')
            return 'failed'
        }

        const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY, {
            encoding: 'base64',
            pbkdf2Iterations: 10000,
            saltLength: 10
        });

        return cryptr.decrypt(encryptedData);
    }
}