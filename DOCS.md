# SnoopBot Official Docs

This is the official documentation of SnoopBot. SnoopBot is a facebook messenger chatbot made with Typescript, NodeJS, Express, PuppeteerJS and the Unofficial Facebook API.

## 📋 Table of Contents
- Getting Started
    - [Setting up](#setting-up)
    - [Configuring Environment Variable](#configuring-environment-variable)
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
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## 🛠️ Setting Up

First, clone this repository:

```bash
git clone https://github.com/SnoopyCodeX/snoopbot-v2
```

After that, you may then open the cloned project in your VSCode.

Then, _(if you haven't yet)_, install the dependencies. Open your VSCode's built-in terminal and type the following:

```bash
npm install
```

Then run the build script like so:

```bash
npm run build
```

This will build SnoopBot’s built-in CLI tool in which we will tackle later on.

## 📝 Configuring Environment Variable

Find <kbd><samp>.env.development</samp></kbd> in the root directory of the project and rename it to <kbd><samp>.env</samp></kbd>. Open it and change the values of the following:

```bash
# For facebook authentication
# Add your facebook account email and password here
FB_EMAIL=
FB_PASS=

# For downloading profile picture using facebook's api
# One of SnoopBot's feature needs to download a user's profile picture using
# facebook graph api. Go to https://developers.facebook.com to get yours.
FB_ACCESS_TOKEN=

# Set this to false if you're deploying this to replit.com
IS_LOCAL=true

# Your secret key for encrypting/decrypting the `state.session` file
CRYPT_SECRET_KEY='mysupersecretkey'
```

> [!WARNING]
> Only use <ins>dummy facebook account</ins> for this bot, I will not be responsible for when facebook marks your account as spam or bans your account

Then find and delete the existing <kbd><samp>state.session</samp></kbd> file in the root directory of the project so that SnoopBot will create a new one for you
based on your facebook account credentials.

## 🤖 Initializing SnoopBot

Open <kbd><samp>src/index.ts</samp></kbd> and you will see this:

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

> [!NOTE]
> SnoopBot CLI Tool is snoopbot's built-in helper command-line tool for easier creation of new command, event handler  and middleware.

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

This will generate a new file for you located in <kbd><samp>src/commands</samp></kbd> folder. The code will look like this:

```typescript
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotCommand } from "@snoopbot";

export default class PlayCommand extends SnoopBotCommand {
    public constructor() {
        super({
            name: "play",
            params: "^play\\s(.*)",
            description: "My awesome command",
            usage: "play <args>"
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

> [!IMPORTANT]
> By the default, the prefix for every commands is <kbd><samp>/</samp></kbd>.

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

This will generate a new file for you located in <kbd><samp>src/events</samp></kbd> folder. The code will look like this:

```typescript
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotEvent } from "@snoopbot";

export default class MyNewEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    public getEventType() : SnoopBotEventType {
        return "gc:member_join"
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
| `message:send` | Triggered when a user sends a message. |

### Binding event handler to an event

You just have to change the return value of the method `getEventType()` like so:

```typescript
public getEventType() : SnoopBotEventType {
    return "event-type-here"
}
```

Refer to the table above for the types of event that you may bind your event handler to.

> [!TIP]
> You may bind **<ins>MULTIPLE EVENT HANDLERS</ins>** to **<ins>ONE TYPE OF EVENT</ins>**.

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

This will generate a new file for you located in <kbd><samp>src/middlewares</samp></kbd> folder. The code will look like this:

```typescript
import { FCAMainAPI, FCAMainEvent } from "@snoopbot/types/fca-types";
import { SnoopBotMiddleware } from "@snoopbot";

export default class MyNewMiddleware extends SnoopBotMiddleware {
    constructor()
    {
        super()
    }

    public getPriority(): number {
        return 1;
    }

    public handle(next: (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => Promise<any>) {
        return async (matches: any[], event: FCAMainEvent, api: FCAMainAPI, extra: SnoopBotCommandExtras) => {
            // Do something in here...

            await next(matches, event, api, extra);
        }
    }
}
```

The `getPriority()` method returns the middleware's priority number. A middleware with a priority number of `1` will be the highest and will be the first middleware to be executed and a middleware with the **<ins>highest priority number</ins>** will be the last to be executed.

The `handle()` method is where you will be coding what you wanna do before executing the commands. The `next()` method will call the next middleware or proceed to the command if no other middlewares are there to be called.

The process looks like this:

```

[incoming message] --> [middleware1 --> middleware2, ...] --> commands 

```

## ℹ️ Contributing

You may fork this repository and create a pull request. See the [Docs](./DOCS.md) on how to work with this repository.

## 🌟 Credits

- [Jerson Carin](https://github.com/jersoncarin)
- [itsmenewbie03](https://github.com/itsmenewbie03)
- [Unofficial Facebook API](https://github.com/VangBanLaNhat/fca-unofficial)

## 🪪 License
```
BSD 3-Clause License

Copyright (c) 2023, SnoopyCodeX

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

```
