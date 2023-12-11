import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { AdminUtils } from "@commands/admin";
import { ThreadWhitelist } from "@commands/joinOrLeave";
import { SnoopBotMiddleware } from "@snoopbot";

export default class JoinOrLeaveMiddleware extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public getPriority(): number {
        return 1;
    }

    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => {
            const whitelist = ThreadWhitelist.getThreadWhitelist()
            const threadAdmins = AdminUtils.getThreadAdmins(event.threadID)
            const botOwner = threadAdmins.botOwner
            const admins = threadAdmins.hasError ? [] : threadAdmins.admins!
            
            const currentBotID = await api.getCurrentUserID()

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