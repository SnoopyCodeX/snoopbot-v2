type SnoopBotOptions = {
    configs?: Object = {};
    handleMatches?: boolean = true;
    debugMode?: boolean = false;
    
    selfListen?: boolean = false;
    listenEvents?: boolean = false;
    listenTyping?: boolean = false;
    updatePresence?: boolean = false;
    forceLogin?: boolean = false;
    autoMarkDelivery?: boolean = true;
    autoMarkRead?: boolean = false;
    autoReconnect?: boolean = true;
    logRecordSize?: number = 100;
    online?: boolean = true;
    emitReady?: boolean = false;
    userAgent?: string = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML; like Gecko) Version/8.0.3 Safari/600.3.18";
}

type SnoopBotCommandOptions = {
    params?: string = '';
    usage?: string = '';
    description?: string = '';
    name?: string = '';
    hasArgs?: boolean = false;
    adminOnly?: boolean = false;
    prefix?: string = '';
    handleMatches?: boolean;
}

type SnoopBotCommandExtras = {
    params?: string = '';
    usage?: string = '';
    description?: string = '';
    name?: string = '';
    hasArgs?: boolean = false;
    adminOnly?: boolean = false;
    prefix?: string = '';
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
     'message:unsend'

type SnoopBotThreadEvent = {
    [key: string]: SnoopBotEvent;
}

type MessageType = {
    [key: string]: any
}