# SnoopBot Official Docs

This is the official documentation of SnoopBot. SnoopBot is a facebook messenger chatbot made with Typescript, NodeJS, Express, PuppeteerJS and the Unofficial Facebook API.

## Table of Contents
- Getting Started
    - [Setting up](#setting-up)
    - [Initializing SnoopBot](#initializing-snoopbot)
    - [SnoopBot CLI Tool](#snoopbot-cli-tool)
- Commands
    - [Creating new command](#creating-new-command)
    - [Command options](#snoopbot-command-options)
- Events
    - [Creating new event handler](#creating-new-event-handler)
    - [Binding handler to events](#binding-event-handler-to-an-event)
    - [Types of events](#snoopbot-event-types)
- Middlewares
    - [Creating new middleware](#creating-new-middleware)

## Setting Up

First, _(if you haven't yet)_, install the dependencies:

```bash
npm install
```

Then build the project:

```bash
npm run build
```

This will also build SnoopBot's built-in CLI tool in which we will tackle later on.

## Initializing SnoopBot

Open _(or create if there's none)_ `src/index.ts` and write this:

```typescript
import 'module-alias/register' // <--- This must always be at the top. DO NOT REMOVE!
import { SnoopBot } from "@snoopbot"

// Initialize SnoopBot
const bot = new SnoopBot()
bot.init({
    selfListen: true,
    debugMode: true
})
```

The `bot.init()` function takes in `SnoopBotOptions` object and these are the following options that you may add:

| Option | Type | Default value | Description |
|:------:|:----:|:-------------:|:------------|
| `debugMode` | `boolean` | `false` | Sets SnoopBot in debugging mode. |
| `handleMatches` | `boolean` | `false` | Will force SnoopBot to let the user handle the regex matches. |
| `logLevel` | `string` | | The desired logging level as determined by npmlog. Choose from `silly`, `verbose`, `info`, `http`, `warn`, `error` and `silent`. |
| `selfListen` | `boolean` | `false` | Set this to true if you want your api to receive messages from its own account. This is to be used with caution, as it can result in loops (a simple echo bot will send messages forever). |
| `listenEvents` | `boolean` | `false` | Will make SnoopBot also handle events. |
| `pageID` | `string` | | Makes SnoopBot only receive messages through the page specified by that ID. Also makes SnoopBot send message from the page. |
| `updatePresence` | `boolean` | `false` | Will make SnoopBot also listen for `presence` events. |
| `forceLogin` | `boolean` | `false` | Will automatically approve recent logins and continue with the login process. |
| `userAgent` | `string` | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18` | The desired simulated user agent. |
| `autoMarkDelivery` | `boolean` | `true` | Will automatically mark new messages as delivered. |
| `autoMarkRead` | `boolean` | `false` | Will automatically mark new messages as read/seen. | 
| `proxy` | `string` | | Set this to proxy server address to use proxy. Note: Only HTTP Proxies which support CONNECT method is supported | 
| `online` | `boolean` | `true` | Set account's online state. | 

## SnoopBot CLI Tool

SnoopBot CLI Tool is snoopbot's built-in helper command-line tool for easier creation of new command, event handler  and middleware.

```bash
snoopbot cli -a <action> -n <name>

# or

snoopbot cli --action <action> --name <name>
```

The argument `action` takes in three options: `create:command`, `create:event` and `create:middleware`.

## Creating new command

In the terminal, type:

```bash
snoopbot cli -a create:command -n <name-of-your-new-command>

# or

snoopbot cli --action create:command --name <name-of-your-new-command>
```

Example:

```bash
snoopbot cli -a create:command -n play
```

This will generate a new file for you located in `src/commands` folder. The code will look like this:

```typescript
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotCommand } from "@snoopbot";

export default class PlayCommand extends SnoopBotCommand {
    public constructor(options?: SnoopBotCommandOptions) {
        super({
            name: "play",
            params: "^play\\s(.*)",
            description: "My awesome command",
            usage: "play <args>",
            ...options
        })
    }

    public async execute(matches: any[], event: FCAMainEvent, api: FCAMainAPI, extras: SnoopBotCommandExtras) {
        // This is where you'll process the command
        api.sendMessage("This is a new command!", event.threadID)
    }
}
```

Inside the constructor of the class is where you will be defining the details regarding your new command. And inside the `execute()` function is where you will process the command when it is called/executed.

The arguments of the `execute()` function are:

| Argument | Type | Description |
|:--------:|:----:|:------------|
| `matches` | `string[]` | A string array of regex matches that is defined in the option `params` of your command. To understand more on what may the value of `matches` argument look like based on your defined regex, check out https://regex101.com and test your regex there. It will show you how the given string matches with your regex. |
| `event` | `FCAMainEvent` | The type of event that SnoopBot has received. Can either be `message` or `message_reply`. For more information, click [here](https://github.com/VangBanLaNhat/fca-unofficial/blob/master/DOCS.md#listen) to see the other types of event that you may have access to. |
| `api` | `FCAMainAPI` | The Unofficial Facebook Chat API. Click [here](https://github.com/VangBanLaNhat/fca-unofficial/blob/master/DOCS.md) for further details. |
| `extras` | `SnoopBotCommandExtras` | An object containing extra data regarding your command. |

And here are the following options that you may define in your command's constructor:

### SnoopBot Command Options

| Option | Type | Description |
|:------:|:----:|:------------|
| `name` | `string` | The name of your command. Must be in lowercase and not contain any spaces. |
| `params` | `string` | The regex pattern for your command. This is where SnoopBot will match the received message and execute the command when the sent message matches your defined regex. |
| `usage` | `string` | The message showing how to use your command. |
| `description` | `string` | The description of your command. |
| `adminOnly` | `boolean` | If set to `true`, only bot administrators and bot owner will be able to use/execute the command. |
| `prefix` | `string` | The prefix to be used for this command. The default is `/`. |
| `hasArgs` | `boolean` | Set this to `true` if your command accepts arguments. |

Once you're done configuring your new command, you may now import it and add it to SnoopBot in your `src/index.ts` file like so:

```typescript
import 'module-alias/register'
import { SnoopBot } from "@snoopbot"

// Import all commands
import * as commands from "@commands"

// Initialize SnoopBot
const bot = new SnoopBot()
bot.init({
    selfListen: true,
    debugMode: true
})

// Add the command
bot.addCommand(new commands.PlayCommand())
```

By the default, the prefix for every commands is `/`.

## Creating new event handler

In the terminal, type:

```bash
snoopbot cli -a create:event -n <name-of-your-new-event-handler>

# or

snoopbot cli --action create:event --name <name-of-your-new-event-handler>
```

Example:

```bash
snoopbot cli -a create:event -n MyNewEvent
```

This will generate a new file for you located in `src/events` folder. The code will look like this:

```typescript
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotEvent } from "@snoopbot";

export default class MyNewEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    public async onEvent(event: FCAMainEvent, api: FCAMainAPI) {
        // Do something...
    }
}
```

Inside the `onEvent()` method is where you will handle the received event. After configuring your new event handler class, you may then bind it to a specific event that SnoopBot emits.

### SnoopBot Event Types

| Event | Description |
|:-----:|:------------|
| `gc:member_join` | Triggered when a user joins a group chat. |
| `gc:member_leave` | Triggered when a user leaves a group chat. |
| `gc:change_icon` | Triggered when a group chat changes its group icon. |
| `gc:change_theme` | Triggered when a group chat changes its theme. |
| `gc:change_name` | Triggered when a group chat changes its name. |
| `user:change_nickname` | Triggered when a user changes his/her nickname. |
| `message:unsend` | Triggered when a user unsends a message. |

### Binding event handler to an event

First that you need to do is import all events from `src/events` folder in your `src/index.ts` file like so:

```typescript
import * as events from "@events"
```

Then you may then bind it to a specific event in SnoopBot like so:

```typescript
bot.on("message:unsend", new events.MyNewEvent())
```

## Creating new middleware

These middlewares are the first things that will be executed before your commands. Example use-case for a middleware is if you wanna check if a user has permission to use commands.

In your terminal, type:

```bash
snoopbot cli -a create:middleware -n <name-of-your-middleware>

# or

snoopbot cli --action create:middleware --name <name-of-your-middleware>
```

Example:

```bash
snoopbot cli -a create:middleware -n MyNewMiddleware
```

This will generate a new file for you located in `src/middlewares` folder. The code will look like this:

```typescript
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotMiddleware } from "@snoopbot";

export default class MyNewMiddleware extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => {
            // Do something in here...

            await next(matches, event, api, extra);
        }
    }
}
```

The `handle()` method is where you will be coding what you wanna do before executing the commands. The `next()` method will call the next middleware or proceed to the command if no other middlewares are there to be called.

The process looks like this:

```

[message] --> [middleware1 --> middleware2, ...] --> commands 

```

After configuring your new middleware, you may then import it in `src/index.ts`:

```typescript
import * as middlewares from "@middlewares"
```

Then add it to SnoopBot:

```typescript
bot.addCommandMiddleware(new middlewares.MyNewMiddleware())
```

The `addCommandMiddleware()` method accepts an array of middlewares and are executed in the order that they were added. Example:

```typescript
bot.addCommandMiddleware(
    new middlewares.MyMiddleware1(),
    new middlewares.MyMiddleware2(),
    new middlewares.MyMiddleware3()
)
```