import { readFileSync, writeFileSync } from "fs";
import { SnoopBotCommand } from "@snoopbot";
import { AdminUtils } from "@commands/admin";
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";

/**
 * Permission Utility class
 * Handles modifying the json settings
 * file which holds the entire list of users
 * that have command permissions in each threads.
 * 
 * @class
 */
export class PermissionUtil {
    constructor() {}

    /**
     * Gets the content of the settings file
     * in json format and returns as an object.
     * 
     * @returns {Object}
     */
    public static getPermissionSettings() {
        const jsonString = readFileSync(`${process.cwd()}/src/snoopbot/lib/permissions.json`, {encoding: 'utf-8'});

        return JSON.parse(jsonString === '' ? "{}" : jsonString);
    }

    /**
     * Overwrites the existing settings file with
     * the new permisison settings.
     * 
     * @param {Object} newPermissionSettings The new permission settings
     */
    public static savePermissionSettings(newPermissionSettings: any): void {
        writeFileSync(`${process.cwd()}/src/snoopbot/lib/permissions.json`, JSON.stringify(newPermissionSettings, undefined, 4), {encoding: "utf-8"});
    }

    /**
     * Checks if a user in a thread has an 
     * existing permission for the commands.
     * 
     * @param {string} threadID The ID of the thread
     * @param {string} userID The ID of the user
     * @param {string[]} commands List of commands
     * @returns {boolean}
     */
    public static userHasPermission(threadID: string, userID: string, ...commands: string[]): boolean {
        const permissions = PermissionUtil.getPermissionSettings();
        let hasPermission = false;

        const threadAdmins = AdminUtils.getThreadAdmins(threadID)
        const admins = threadAdmins.hasError ? [] : threadAdmins.admins!

        if(admins.includes(userID) || (userID === threadAdmins.botOwner))
            return true

        if(permissions[threadID] != null) {
            const users = permissions[threadID].users;

            if(users[userID] !== undefined) {
                const user = users[userID];
                const perms = user.permissions;

                let count = 0;
                for(const command of commands) 
                    count += perms.includes(command) ? 1 : 0;

                hasPermission = count === commands.length;
            }
        }

        return hasPermission;
    }

    /**
     * Adds the list of granted commands to a user
     * in a thread.
     * 
     * @param {string} threadID The ID of the thread
     * @param {string} userID The ID of the user
     * @param {string[]} commands The list of commands to add
     * @returns {boolean}
     */
    public static addPermissionToUserInThread(threadID: string, userID: string, ...commands: string[]): boolean {
        if(PermissionUtil.userHasPermission(threadID, userID, ...commands))
            return false;

        const permissions = PermissionUtil.getPermissionSettings();

        permissions[threadID] = (permissions[threadID] === undefined) ? {} : permissions[threadID];
        permissions[threadID].users = (permissions[threadID].users === undefined) ? {} : permissions[threadID].users;
        permissions[threadID].users[userID] = (permissions[threadID].users[userID] === undefined) ? {} : permissions[threadID].users[userID];
        permissions[threadID].users[userID].permissions = (permissions[threadID].users[userID].permissions === undefined) ? [] : permissions[threadID].users[userID].permissions;
        permissions[threadID].users[userID].permissions.push(...commands);

        PermissionUtil.savePermissionSettings(permissions);

        return true;
    }

    /**
     * Removes the list of commands from a user
     * in a thread.
     * 
     * @param {string} threadID The ID of the thread
     * @param {string} userID The ID of the user
     * @param {string[]} commands The list of commands to be removed
     * @returns 
     */
    public static removePermissionFromUserInThread(threadID: string, userID: string, ...commands: string[]): boolean {
        const permissions = PermissionUtil.getPermissionSettings();

        if(permissions[threadID] === undefined 
            || permissions[threadID].users === undefined
            || permissions[threadID].users[userID] === undefined
            || permissions[threadID].users[userID].permissions === undefined)
            return false;
            
        if(permissions[threadID].users[userID].permissions.length === 0)
            return true;

        const userGrantedPerms = permissions[threadID].users[userID].permissions;

        permissions[threadID].users[userID].permissions = userGrantedPerms.filter((command: string) => !commands.includes(command))

        if(permissions[threadID].users[userID].permissions.length === 0)
            delete permissions[threadID].users[userID];
	
        if(Object.entries(permissions[threadID].users).length === 0)
            delete permissions[threadID].users;
        
        if(Object.entries(permissions[threadID]).length === 0)
            delete permissions[threadID];

        PermissionUtil.savePermissionSettings(permissions);

        return true;
    }
}

export default class PermissionCommand extends SnoopBotCommand {
    constructor() {
        super({
            name: 'permission',
            params: '^permission\\s(grant|revoke|list)\\s([^@]+)\\s?(.*)?',
            description: 'Grant, revoke or list permission',
            usage: 'permission <grant|revoke|list> <all | command1, ...> <@all | @person1, ....>',
            hasArgs: true,
            adminOnly: true
        });
    }

    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras) {
        const action = matches[1]; // grant | revoke | list
        const commandsToGive = (matches[2] as string).trim().split(','); // all | <command1, command2, ...>
        const persons = event.mentions; // <@person1, @person2, ...>

        switch(action) {
            case 'grant':
                await this.grant(matches, event, api, commandsToGive, extras.commands, persons)
                break;

            case 'revoke':
                await this.revoke(matches, event, api, commandsToGive, extras.commands, persons);
                break;

            case 'list':
                await this.list(matches, event, api);
                break;
        }
    }

    private async grant(matches: any[], event: FCAMainEvent, api: FCAMainAPI, commandsToGive: string[], commands: SnoopBotCommandOptions[], persons: any) {
        const mentions = [];
        
        // If admin specified "all", list all available commands in the bot
        if(commandsToGive[0] === "all")
            commandsToGive = commands.map((command) => command.name!);

        // If no mentions
        if(Object.entries(persons).length === 0) {
            // If no @all
            if(matches[0].indexOf("@all") === -1) {
                api.sendMessage("⚠️No person is being granted permission(s), please type @all or @person.", event.threadID, event.messageID);
                return;
            }

            const threadInfo = await api.getThreadInfo(event.threadID);
            const threadAdmins = AdminUtils.getThreadAdmins(event.threadID)
            const botOwner = threadAdmins.botOwner
            const botID = await api.getCurrentUserID();
            const { participantIDs } = threadInfo;

            participantIDs.forEach((participantID: any) => {
                let userInfo:any;

                for(const uinfo of threadInfo.userInfo)
                    if(uinfo.id === participantID) {
                        userInfo = uinfo;
                        break;
                    }

                if(userInfo.id === botID || userInfo.id === botOwner) return;

                persons[userInfo.id] = `@${userInfo.name}`;
            });
        }

        // Check if command specified exists in the bot
        const hasCommands = commands.some((command) => commandsToGive.includes(command.name!));
        if(!hasCommands) {
            api.sendMessage("⚠️ Unknown command(s): '" + commandsToGive.join(',') + "'.", event.threadID, event.messageID);
            return;
        }

        // Filter out commands that are for admins only
        const adminCommands = commands
            .filter((command) => command.adminOnly)
            .map((command) => command.name!);

        commandsToGive = commandsToGive
            .filter((command) => !adminCommands.includes(command))
            .map((command) => command.trim())

        // Grant permissions to all mentioned users
        let msg = "🤖Gave permission to: \n\n";
        for(const key in persons) {
            PermissionUtil.addPermissionToUserInThread(event.threadID, key, ...commandsToGive);

            msg += persons[key] + " ";
            mentions.push({
                id: key,
                tag: persons[key],
                fromIndex: msg.lastIndexOf(persons[key])
            });
        }
        msg = msg.substring(0, msg.length - 1);

        const message = {
            body: `${msg}\n\nFor command(s): \n\n'${commandsToGive.join(", ")}'.`,
            mentions
        };

        api.sendMessage(message, event.threadID, event.messageID);
        return;
    }

    private async revoke(matches: any[], event: FCAMainEvent, api: FCAMainAPI, commandsToRevoke: string[], commands: SnoopBotCommandOptions[], persons: any) {
        const mentions = [];

        // If admin specified 'all'
        if(commandsToRevoke[0] === 'all')
            commandsToRevoke = commands.map((command) => command.name!);

        // If no mentions
        if(Object.entries(persons).length === 0) {
            // If no @all
            if(matches[0].indexOf("@all") === -1) {
                api.sendMessage("⚠️No person is being revoked of permission(s), please type @all or @person.", event.threadID, event.messageID);
                return;
            }

            const threadInfo = await api.getThreadInfo(event.threadID);
            const threadAdmins = AdminUtils.getThreadAdmins(event.threadID)
            const botOwner = threadAdmins.botOwner
            const botID = await api.getCurrentUserID();
            const { participantIDs } = threadInfo;
            participantIDs.forEach((participantID: any) => {
                let userInfo: any;

                for(const uinfo of threadInfo.userInfo)
                    if(uinfo.id === participantID) {
                        userInfo = uinfo;
                        break;
                    }

                if(userInfo.id === botID || userInfo.id === botOwner) return;

                persons[userInfo.id] = `@${userInfo.name}`;
            });
        }

        // Check if command exists
        const hasCommand = commands.some((command) => commandsToRevoke.includes(command.name!));
        if(!hasCommand) {
            api.sendMessage("⚠️Unknown command(s): '" + commandsToRevoke.join(",") + "'.", event.threadID, event.messageID);
            return;
        }

        // Filter out commands that are for admins only
        const adminCommands = commands
            .filter((command) => command.adminOnly)
            .map((command) => command.name!);

        commandsToRevoke = commandsToRevoke
            .filter((command) => !adminCommands.includes(command))
            .map((command) => command.trim())

        // Revoke permissions to all mentioned users
        let msg = "🤖Revoked permission to: \n\n";
        for(const key in persons) {
            PermissionUtil.removePermissionFromUserInThread(event.threadID, key, ...commandsToRevoke);

            msg += persons[key] + " ";
            mentions.push({
                id: key,
                tag: persons[key],
                fromIndex: msg.lastIndexOf(persons[key])
            });
        }
        msg = msg.substring(0, msg.length - 1);

        const message = {
            body: `${msg}\n\nFor command(s): \n\n'${commandsToRevoke.join(", ")}'.`,
            mentions
        };

        api.sendMessage(message, event.threadID, event.messageID);
        return;
    }

    private async list(matches: any[], event: FCAMainEvent, api: FCAMainAPI) {
        api.sendMessage("🤖This command is currently under development.", event.threadID, event.messageID);
        return;
    }
}