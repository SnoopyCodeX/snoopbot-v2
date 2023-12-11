type SnoopBotOptions = {
    handleMatches?: boolean;
    debugMode?: boolean;
    
    selfListen?: boolean;
    listenEvents?: boolean;
    listenTyping?: boolean;
    updatePresence?: boolean;
    forceLogin?: boolean;
    autoMarkDelivery?: boolean;
    autoMarkRead?: boolean;
    autoReconnect?: boolean;
    logRecordSize?: number;
    online?: boolean;
    emitReady?: boolean;
    userAgent?: string;
}

type SnoopBotCommandOptions = {
    params?: string;
    usage?: string;
    description?: string;
    name?: string;
    hasArgs?: boolean;
    adminOnly?: boolean;
    prefix?: string;
    handleMatches?: boolean;
}

type SnoopBotCommandExtras = {
    params?: string;
    usage?: string;
    description?: string;
    name?: string;
    hasArgs?: boolean;
    adminOnly?: boolean;
    prefix?: string;
    handleMatches?: boolean;
    commands: SnoopBotCommandOptions[];
    debugMode?: boolean;
    global: any;
}

/**
 * Types of events that are triggered
 * in a conversation/thread
 * 
 * @event gc:member_join Triggered when a user joins a group chat
 * @event gc:member_join Triggered when a user leaves a group chat
 * @event gc:change_icon Triggered when a group chat changes its icon
 * @event gc:change_theme Triggered when a group chat changes its theme
 * @event gc:change_name Triggered when a group chat changes its name
 * @event user:change_nickname Triggered when a user changes its nickname
 * @event message:unsend Triggered when a message is unsent
 */
type SnoopBotEventType = 
     'gc:member_join' |
     'gc:member_leave' |
     'gc:change_icon' | 
     'gc:change_theme' | 
     'gc:change_name' |
     'user:change_nickname' | 
     'message:unsend' |
     'message:send' 

type SnoopBotThreadEvent = {
    [key: string]: SnoopBotEvent[];
}

type MessageType = {
    [key: string]: any
}