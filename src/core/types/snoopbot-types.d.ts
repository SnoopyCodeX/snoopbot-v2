type SnoopBotOptions = {
    configs: Object = {};
    handleMatches: boolean = true;
    
    selfListen: boolean = false;
    listenEvents: boolean = false;
    listenTyping: boolean = false;
    updatePresence: boolean = false;
    forceLogin: boolean = false;
    autoMarkDelivery: boolean = true;
    autoMarkRead: boolean = false;
    autoReconnect: boolean = true;
    logRecordSize: number = 100;
    online: boolean = true;
    emitReady: boolean = false;
    userAgent: string = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML; like Gecko) Version/8.0.3 Safari/600.3.18";
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
    global: any;
}