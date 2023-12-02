import { EventEmitter } from "stream";

declare module "fca-unofficial";

type FCAMessageReaction = 
    "\uD83D\uDE0D" | // :heart_eyes:
    "\uD83D\uDE06" | // :laughing:
    "\uD83D\uDE2E" | // :open_mouth:
    "\uD83D\uDE22" | // :cry:
    "\uD83D\uDE20" | // :angry:
    "\uD83D\uDC4D" | // :thumbsup:
    "\uD83D\uDC4E" | // :thumbsdown:
    "\u2764" | // :heart:
    "\uD83D\uDC97" // :glowingheart:
    "" |
    ":heart_eyes:" |
    ":love:" |
    ":laughing:" |
    ":haha:" |
    ":open_mouth:" |
    ":wow:" |
    ":cry:" |
    ":sad:" |
    ":angry:" |
    ":thumbsup:" |
    ":like:" |
    ":thumbsdown:" |
    ":dislike:" |
    ":heart:" |
    ":glowingheart:"

type FCAPostReaction = 
    "like" |
    "heart" |
    "wow" |
    "haha" |
    "sad" |
    "angry"

type FCAMessageFolder = 'inbox' | 'archive'

type FCAEmojiSizes = 32 | 64 | 128
type FCAEmojiPixelRatio = '1.0' | '1.5' 

type FCAFriendListResult = {
    alternateName: string;
    firstName: string;
    gender: any;
    userID: string;
    isFriend: boolean;
    fullName: string;
    profilePicture: string;
    type: any;
    profileUrl: string;
    vanity: any;
    isBirthday: boolean;
}

type FCAUserType = 'user' | 'group' | 'page' | 'event' | 'app'
type FCAUserInfoResult = {
    [key: string]: FCAUserInfo;
}
type FCAUserInfo = {
    id?: any;
    name: string;
    firstName: string;
    vanity: any;
    thumbSrc: string;
    profileUrl: string;
    gender: any;
    type: FCAUserType;
    isFriend: boolean;
    isBirthday: boolean;
    searchTokens: any;
    alternateName: string;
}

type FCAUserIDResult = {
    userID: string;
    photoUrl: string;
    indexRank: any;
    name: string;
    isVerified: boolean;
    profileUrl: string;
    category: any;
    score: any;
    type: FCAUserType;
}

type FCAApprovalQueue = {
    inviterID: string;
    requesterID: string;
    timestamp: any;
}
type FCAThreadInfoResult = {
    threadID: string;
    participantIDs: string[];
    threadName: string;
    userInfo: FCAUserInfo[];
    nicknames?: any;
    unreadCount: number;
    messageCount: number;
    imageSrc?: string;
    timestamp: any;
    muteUntil?: number;
    isGroup: boolean;
    isSubscribed?: any;
    folder: FCAMessageFolder;
    isArchived: boolean;
    cannotReplyReason?: string;
    lastReadTimestamp: any;
    emoji?: string;
    color: string;
    adminIDs: string[];
    approvalMode: boolean;
    approvalQueue: FCAApprovalQueue[];
}

type FCAThreadListInfoResult = {
    threadID: string;
    name: string;
    unreadCount: number;
    messageCount: number;
    imageSrc?: string;
    emoji?: string;
    color?: string;
    nicknames: any;
    muteUntil?: any;
    participants: any;
    adminIDs: string[];
    folder: 'INBOX'|'ARCHIVED'|'PENDING'|'OTHER';
    isGroup: boolean;
    customizationEnabled: boolean;
    participantAddMode?: any;
    reactionsMuteMode: any;
    mentionsMuteMode: any;
    isArchived: boolean;
    isSubscribed: boolean;
    timestamp: any;
    snippet: string;
    snippetAttachments: any;
    snippetSender: string;
    lastMessageTimestamp: any;
    lastReadTimestamp: any;
    cannotReplyReason?: string;
    approvalMode: boolean;
}

type FCAThreadPictureResult = {
    url: string;
    width: number;
    height: number;
}

type FCAMessageMentions = {
    [key: string]: string;
}

type FCAMessageAttachmentType = 
    'sticker' |
    'file' | 
    'photo' |
    'animated_image' |
    'video' |
    'audio' |
    'location' |
    'share'
type FCAMessageAttachment = {
    type: FCAMessageAttachmentType;
    ID: string;
    url: string;
    /** Stickers */
    filaname?: string;
    packID?: string;
    spriteUrl?: string;
    spriteUrl2x?: string;
    width?: number;
    height?: number;
    caption?: string;
    description?: string;
    frameCount?: number;
    frameRate?: number;
    framesPerRow?: number;
    framesPerCol?: number;
    /** File */
    isMalicious?: boolean;
    contentType?: string;
    /** Photo */
    thumbnailUrl?: string;
    previewUrl?: string;
    previewWidth?: number;
    previewHeight?: number;
    largePreviewUrl?: string;
    largePreviewWidth?: number;
    largePreviewHeight?: number;
    /** Animated Image (GIF) */
    /** Video */
    duration?: number;
    videoType?: string;
    /** Audio */
    audioType?: string;
    isVoiceMail?: boolean;
    /** Location */
    latitude?: any;
    longitude?: any;
    image?: string;
    address?: string;
    /** Share */
    title?: string;
    source?: string;
    playable?: boolean;
    playableUrl?: string;
    subattachments?: any;
    properties?: any;
}

type FCAMainEventType = 
    'message' | 
    'event' | 
    'typ' | 
    'read' | 
    'read_receipt' | 
    'message_reaction' | 
    'presence' | 
    'message_unsend' | 
    'message_reply'

type FCAMainEventLogType = 
    'log:subscribe' |
    'log:unsubscribe' |
    'log:thread-name' |
    'log:thread-color' |
    'log:thread-icon' |
    'log:user-nickname'

type FCAMessageReply = {
    attachments: FCAMessageAttachment[];
    body: string;
    isGroup: boolean;
    mentions: FCAMessageMentions;
    messageID: string;
    senderID: string;
    threadID: string;
    isUnread: boolean;
    type: FCAMainEventType;
}

type FCAOptionLogLevel = 
    'silly' |
    'verbose' |
    'info' |
    'http' |
    'warn' |
    'error' |
    'silent'

type FCAOptions = {
    logLevel?: FCAOptionLogLevel;
    selfListen?: boolean;
    listenEvents?: boolean;
    pageID?: string;
    updatePresence?: boolean;
    forceLogin?: boolean;
    userAgent?: string;
    autoMarkDelivery?: boolean;
    autoMarkRead?: boolean;
    proxy?: any;
    online?: boolean; string;}

type FCAThreadColors = {
    MessengerBlue: string;  //DefaultBlue
    Viking: string; //TealBlue
    GoldenPoppy: string;  //Yellow
    RadicalRed: string; //Red
    Shocking: string; //LavenderPurple
    FreeSpeechGreen: string; //Green
    Pumpkin: string;  //Orange
    LightCoral: string;  //CoralPink
    MediumSlateBlue: string;  //BrightPurple
    DeepSkyBlue: string; //AquaBlue
    BrilliantRose: string;  //HotPink

    DefaultBlue: string;
    HotPink: string;
    AquaBlue: string;
    BrightPurple: string;
    CoralPink: string;
    Orange: string;
    Green: string;
    LavenderPurple: string;
    Red: string;
    Yellow: string;
    TealBlue: string;
    Aqua: string;
    Mango: string;
    Berry: string;
    Citrus: string;
    Candy: string;
}

type FCAMainEvent = {
    type: FCAMainEventType;
    attachments?: FCAMessageAttachment[];
    threadID: string;
    messages?: any;
    /** Message */
    body?: string;
    isGroup?: boolean;
    mentions?: FCAMessageMentions;
    messageID?: string;
    senderID?: string;
    isUnread?: boolean;
    /** Message Reply */
    messageReply?: FCAMessageReply;
    /** Event */
    author?: string;
    logMessageBody?: string;
    logMessageData?: any;
    logMessageType:? FCAMainEventLogType;
    /** Typing */
    from?: string;
    fromMobile?: boolean;
    isTyping?: boolean;
    /** Read */
    time?: any;
    /** Read Receipt */
    reader?: string;
    /** Message Reaction */
    offlineThreadingID?: string;
    reaction?: string;
    timestamp?: any;
    userID?: string;
    /** Presence */
    statuses?: number;
    /** Message Unsend */
    deletionTimestamp?: any;
}

type FCAMainAPI = {
    addExternalModule: (moduleObject: object) => void;
    addUserToGroup: (userID: string|Array<string|number>|number, threadID: string|string[]|number, callback?: (err: any) => void) => Promise<any>;
    changeAdminStatus: (threadID: string, adminIDs: string|string[], adminStatus: boolean, callback?: (err: any) => void) => Promise<any>;
    changeArchivedStatus: (threadOrThreads: string|string[], archive: any, callback?: (err: any) => void) => Promise<any>;
    changeBio: (bio?: string, publish?: ()=>Promise<any>|Function|boolean, callback?: (err: any) => void) => Promise<any>;
    changeBlockedStatus: (userID: string, block: boolean, callback?: (err: any) => void) => Promise<any>;
    changeGroupImage: (image: any, threadID: string, callback?: (err: any) => void) => Promise<any>;
    changeNickname: (nickname: string, threadID: string, participantID: string, callback?: (err: any) => void) => Promise<any>;
    changeThreadColor: (color?: string, threadID: string, callback?: (err: any) => void) => Promise<any>;
    changeThreadEmoji: (emoji: string, threadID: string, callback?: (err: any) => void) => Promise<any>;
    createNewGroup: (participantIDs: string[], groupTitle: string, callback?: (err: any, threadID: any) => void) => Promise<any>;
    createPoll: (title: string, threadID: string, options: Record<string, boolean>, callback?: (err: any) => void) => Promise<any>;
    deleteMessage: (messageOrMessages: string[]|string, callback?: (err: any) => void) => Promise<any>;
    deleteThread: (threadOrThreads: string|string[], callback?: (err: any) => void) => Promise<any>;
    forwardAttachment: (attachmentID: string, userOrUsers: string[]|string, callback?: (err: any) => void) => Promise<any>;
    getAppState: () => any;
    getCurrentUserID: () => Promise<any>;
    getEmojiUrl: (character: string, size: FCAEmojiSizes, pixelRatio: FCAEmojiPixelRatio) => string;
    getFriendsList: (callback?: (err: any, friendList: FCAFriendListResult[]) => void) => Promise<FCAFriendListResult[]>;
    getThreadHistory: (threadID: string, amount: number, timestamp?: any, callback?: (err: any, data: any) => void) => Promise<any>;
    getThreadInfo: (threadID: string, callback?: (err: any, data: FCAThreadInfoResult) => void) => Promise<FCAThreadInfoResult>;
    getThreadList: (limit: number, timestamp?: number|null, tags: string[], callback?: (err: any, data: FCAThreadListInfoResult[]) => void) => Promise<FCAThreadListInfoResult[]>;
    getThreadPictures: (threadID: string, offset: any, limit: any, callback?: (err: any, data: FCAThreadPictureResult[]) => void) => Promise<FCAThreadPictureResult[]>;
    getUserID: (name: string, callback?: (err: any, data: FCAUserIDResult[]) => void) => Promise<FCAUserIDResult[]>;
    getUserInfo: (id: string|string[], callback?: (err: any, data: FCAUserInfoResult) => void) => Promise<FCAUserInfoResult>;
    handleFriendRequest: (userID: string, accept: boolean, callback?: (err: any) => void) => Promise<any>;
    handleMessageRequest: (threadID: string, accept: boolean, callback?: (err: any) => void) => Promise<any>;
    httpGet: (url: string, form: any, callback?: (err: any, data: any) => void|Promise<any>, notAPI: boolean) => Promise<any>;
    httpPost: (url: string, form: any, callback?: (err: any, data: any) => void|Promise<any>, notAPI: boolean) => Promise<any>;
    listen: (callback?: (err: any, message: any) => void|Promise<any>) => EventEmitter;
    listenMqtt: (callback?: (err: any, message: any) => void|Promise<any>) => EventEmitter;
    logout: (callback?: (err: any) => void) => Promise<any>;
    markAsDelivered: (threadID: string, messageID: string, callback?: (err: any) => void) => Promise<any>;
    markAsRead: (threadID: string, read?: boolean|((err: any) => void), callback?: (err: any) => void) => Promise<any>;
    markAsReadAll: (callback?: (err: any) => void) => Promise<any>;
    markAsSeen: (seen_timestamp: any, callback?: (err: any) => void) => Promise<any>;
    muteThread: (threadID: string, muteSeconds: number, callback?: (err: any) => void) => Promise<any>;
    removeUserFromGroup: (userID: string, threadID: string, callback?: (err: any) => void|Promise<any>) => Promise<any>;
    resolvePhotoUrl: (photoID: string, callback?: (err: any, photoURL: any) => void) => Promise<string>;
    searchForThread: (name: string, callback?: (err: any, threads: any) => void) => Promise<any>;
    sendMessage: (message: string|any, threadID: string|string[]|number, messageID?: string|undefined, callback?: (err: any, messageInfo: any) => void, isGroup?: boolean) => Promise<any>;
    sendTypingIndicator: (type, threadID: string, callback?: (err: any) => void, isGroup: boolean) => Promise<any>;
    setMessageReaction: (reaction: FCAMessageReaction|string, messageID: string, callback?: (err: any) => void, forceCustomReaction?: boolean) => Promise<any>;
    setOptions: (options: FCAOptions) => void;
    setPostReaction: (postID: string, type: FCAPostReaction, callback?: (err: any) => void) => Promise<any>;
    setTitle: (newTitle: string, threadID: string, callback?: (err: any) => void) => Promise<any>;
    threadColors: FCAThreadColors;
    unfriend: (userID: string, callback?: (err: any) => void) => Promise<any>;
    unsendMessage: (messageID: string, callback?: (err: any) => void) => Promise<any>;
}