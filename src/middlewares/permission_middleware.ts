import { AdminUtils } from "../commands/admin";
import { PermissionUtil } from "../commands/permission";
import { SnoopBotMiddleware } from "../snoopbot";

export default class PermissionMiddleware extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public handle(next: (matches: any[], event: any, api: any, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: any, api: any, extra: SnoopBotCommandExtras) => {
            if(matches.length == 0) return

            let threadAdmins = AdminUtils.getThreadAdmins(event.threadID)
            let admins = threadAdmins.hasError ? [] : threadAdmins.admins!
            let command = matches[0].split(" ")[0]

            if(!PermissionUtil.userHasPermission(event.threadID, event.senderID, command)) {
                let message = "⚠️You do not have permission to use this command."
                api.sendMessage(message, event.threadID, event.messageID);

                return
            }

            if(!admins.includes(event.senderID) && (event.senderID !== threadAdmins.botOwner) && !!extra.adminOnly!) {
                let message = `⚠️This command is for bot administrators only!`
                api.sendMessage(message, event.threadID, event.messageID)

                return
            }

            await next(matches, event, api, extra);
        }
    }
}