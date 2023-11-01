import { SnoopBotCommand, Logger } from "../snoopbot";

export default class SenderInfoCommand extends SnoopBotCommand {
    public constructor(options?: SnoopBotCommandOptions) {
        super({
            name: 'my-info',
            params: '^my-info\\s?(.*)?',
            usage: 'my-info',
            description: 'Shows the sender\'s profile information',
            ...options
        })
    }

    public async execute(matches: any[], event: any, api: any, extras: SnoopBotCommandExtras): Promise<void> {
        let profileInfo = await api.getUserInfo([event.senderID]);

        /**
         * {
         *   "100087000531483":{
         *      "name": "Chart JS",
         *      "firstName": "Chart",
         *      "vanity":"",
         *      "thumbSrc":"https://scontent.fdvo1-2.fna.fbcdn.net/v/t39.30808-1/391629901_287189107524438_1139085191678940080_n.jpg?stp=c0.0.32.32a_cp0_dst-jpg_p32x32&_nc_cat=107&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeGRP5h82CY20HE2Q9Gis-79DQXggRsCREYNBeCBGwJERsQpN-mfIRZB5V_Xv8YyKIMloDwA51A8mfhPGNsiSoN6&_nc_ohc=lpL68x56CwcAX-7RZ0x&_nc_ht=scontent.fdvo1-2.fna&oh=00_AfDQeus3A4xxY2dj6Gn7bNqlEQhe1CRKgmJwfW5_tA8vQw&oe=6545B830",
         *      "profileUrl":"https://www.facebook.com/profile.php?id=100087000531483",
         *      "gender":2,
         *      "type":"friend",
         *      "isFriend":true,
         *      "isBirthday":false
         *    }
         *  }
         * 
         *  https://graph.facebook.com/{facebookId}/picture?type=large
         */

        for(let senderId in profileInfo) {
            if(profileInfo.hasOwnProperty(senderId)) {

            }
        }

        Logger.muted(`Sender ID: ${event.senderID} Sender Info: ${JSON.stringify(profileInfo)}`)
    }
}