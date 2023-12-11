import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { AdminUtils } from "@commands/admin";
import { PermissionUtil } from "@commands/permission";
import { SnoopBotMiddleware } from "@snoopbot";

export default class PermissionMiddleware extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public getPriority(): number {
        return 2;
    }

    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => {
            if(matches.length == 0) return

            const threadAdmins = AdminUtils.getThreadAdmins(event.threadID)
            const admins = threadAdmins.hasError ? [] : threadAdmins.admins!
            const command = matches[0].split(" ")[0]

            if(!admins.includes(event.senderID!) && (event.senderID! !== threadAdmins.botOwner) && !!extra.adminOnly!) {
                const message = `⚠️This command is for bot administrators only!`
                api.sendMessage(message, event.threadID, event.messageID)

                return
            }

            if(!PermissionUtil.userHasPermission(event.threadID, event.senderID!, command)) {
                const message = "⚠️You do not have permission to use this command."
                api.sendMessage(message, event.threadID, event.messageID);

                return
            }

            await next(matches, event, api, extra);
        }
    }
}