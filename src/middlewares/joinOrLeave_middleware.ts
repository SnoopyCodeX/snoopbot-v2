import { FCAMainAPI, FCAMainEvent } from "snoopbot/types/fca-types";
import { AdminUtils } from "../commands/admin";
import { ThreadWhitelist } from "../commands/joinOrLeave";
import { SnoopBotMiddleware } from "../snoopbot";

export default class JoinOrLeaveMiddleware extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => {
            let whitelist = ThreadWhitelist.getThreadWhitelist()
            let threadAdmins = AdminUtils.getThreadAdmins(event.threadID)
            let botOwner = threadAdmins.botOwner
            let admins = threadAdmins.hasError ? [] : threadAdmins.admins!
            
            let currentBotID = await api.getCurrentUserID()

            if(!whitelist.threads.includes(event.threadID) && 
                (event.senderID! !== currentBotID) &&
                (botOwner !== event.senderID!) &&
                !admins.includes(event.senderID!)
            ) {
                return
            }

            await next(matches, event, api, extra);
        }
    }
}