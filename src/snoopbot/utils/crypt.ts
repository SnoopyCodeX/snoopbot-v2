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

        let cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY, {
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

        let cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY, {
            encoding: 'base64',
            pbkdf2Iterations: 10000,
            saltLength: 10
        });

        return cryptr.decrypt(encryptedData);
    }
}