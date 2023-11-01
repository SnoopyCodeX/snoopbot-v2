# SnoopBot v2 :robot:

**SnoopBot v2** is an opensource **facebook messenger chatbot** that is made for educational purposes only. This chatbbot can be customized to your liking.

### Techs Used

- NodeJS
- Typescript
- PuppeteerJS

![Preview](./screenshots/preview.png)

### Documentation
- [Getting Started](#getting-started)
    - [Creating instance of snoopbot](#creating-instance-of-snoopbot)
        - [SnoopBotOptions](#snoopbotoptions)

    - [Adding new command](#adding-new-command)
        - [SnoopBotCommandOptions](#snoopbotcommandoptions)
        - [Creating your new command](#creating-your-new-command-class)
        - [Exporting your new command](#exporting-your-new-command)
        - [Importing your new command](#importing-your-new-command)
        - [Adding your new command to snoopbot](#adding-your-new-command-to-snoopbot)

    - [Binding to events](#listening-to-events)
        - [Event Types](#event-types)
        - [Creating your new event handler class](#defining-an-event-class)
        - [Exporting your new event handler class](#exporting-your-event-handler-class)
        - [Importing your new event handler class](#importing-your-event-handler-class)
        - [Binding your event handler class to an event](#binding-your-event-handler-class-to-an-event)

- [Cloning](#cloning)
- [Deploying](#deploying-locally)


## Getting Started
### Creating instance of SnoopBot

Creating an instance of snoopbot is pretty straightforward, you just have to import it
and then use it like so:

Example: `src/index.ts`

```typescript
import { SnoopBot } from './snoopbot'

const bot = new SnoopBot()
bot.init()
```

#### SnoopBotOptions

The `init()` function takes in an optional argument `SnoopBotOptions` like so:

```typescript

bot.init({
    handleMatches: false,
    selfListen: false,
    listenEvents: false,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: false,
    autoMarkRead: false,
    autoReconnect: true,
    logRecordSize: 100,
    online: true,
    emitReady: false,
    userAgent: ""
})

```

>For further information about these options, please see the documentation of [Unofficial FCA](https://github.com/VangBanLaNhat/fca-unofficial).

### Adding new command

```typescript
bot.addCommand(command: SnoopBotCommand);
```

#### Creating your new command class

Every commands of the bot should be inside of `src/commands` folder. And each command should be a class extending `SnoopBotCommand` class.

Example: `mycommand.ts`

```typescript
import { SnoopBotCommand } from "../snoopbot"

export default class MyCommand extends SnoopBotCommand {
    public constructor(options?: SnoopBotCommandOptions) {
        super({
            // name: "mycommand",
            // params: "^mycommands",
            // ...,
            ...options
        })
    }

    public async execute(matches: any[], event: any, api: any, extras: SnoopBotCommandExtras) {
        // Do something when command is executed...
    }
}
```

### SnoopBotCommandOptions:

| Option | Default Value | Description |
|:------:|:-------------:|-------------|
| `params` | `""` | The regex pattern of the command |
| `usage`  | `""` | The descriptive usage of the command |
| `description` | `""` | The description of the command |
| `name` | `""` | The name of the command |
| `hasArgs` | `false` | If set to `true`, snoopbot will expect that this command accepts arguments |
| `adminOnly` | `false` | If set to `true`, users without permission won't be able to use this command |
| `prefix` | `""` | If specified, this command will have its own prefix. By default, the prefix for all commands is `"/"`. |
| `handleMatches` | `false` | If regex matches should be handled by snoopbot or not. |

The `execute()` function is then executed when the received message matches the command's regex pattern.

All arguments of `execute()` function:

`matches`: The array of message pieces that matched the regex pattern. This is where you can get the arguments of your command.

EG: You have a command that plays music like: `/play <song title>`

```typescript
messageReceived = "play Your name"

// Your regex pattern
params: "^play\\s(.*)"

// The value of matches:
matches = ['play', 'Your name']
```

`event`: The event object received. See docs [here](https://github.com/VangBanLaNhat/fca-unofficial).

`api`: The facebook chat api. See docs [here](https://github.com/VangBanLaNhat/fca-unofficial).

`extras`: SnoopBotCommandExtras, this contains the defined options of the command.

----

#### Exporting your new command

After creating your new command, you can then export it in your `src/commands/index.ts` file like so:

```typescript
export { default as MyCommand } from "./mycommand"
```

#### Importing your new command

You can then import it in your `src/index.ts` like:

```typescript
import * as commands from './commands'

//or

import { MyCommand } from './commands'
```

#### Adding your new command to snoopbot

After that, you may now use it in `src/index.ts` like:

```typescript
import * as commands from './commands'

bot.addCommand(new commands.MyCommand())
```

### Listening to events

```typescript
bot.on(eventType: string, eventClass: SnoopBotEvent);
```

#### Event Types

You can listen to various event type that snoopbot offers so that you could respond
accordingly. Here are the list of events that you can bind to:

| Event | Description |
|:-----:|:------------|
| `gc:member_join` | Triggered when a user joins a group chat |
| `gc:member_leave` | Triggered when a user leaves a group chat |
| `gc:change_icon` | Triggered when a group chat changes its group icon/picture |
| `gc:change_theme` | Triggered when a group chat changes its theme |
| `gc:change_name` | Triggered when a group chat changes its group name |
| `user:change_nickname` | Triggered when a user changes its nickname in a thread |
| `message:unsend` | Triggered when a message is unsent in a thread |

#### Defining an event handler class

Each event class should be in `src/events` folder and each class should extend the `SnoopBotEvent` class.

Example: `myevent.ts`

```typescript
import { SnoopBotEvent } from "../snoopbot";

export default class MyEvent extends SnoopBotEvent {
    public constructor()
    {
        super()
    }

    public async onEvent(event: any, api: any) {}
}
```

#### Exporting your event handler class

After defining your new event class, you can then export it in `src/events/index.ts` file like so:

```typescript

export { default as MyEvent } from './myevent'
 
```

#### Importing your event handler class

Next, you can then import it in your `src/index.ts` like so:

```typescript

import * as events from './events'

// or 

import { MyEvent } from './events'

```

#### Binding your event handler class to an event

You can then bind it to snoopbot via the `on()` function like so:

```typescript
import * as events from './events'

bot.on('gc:member_join', new events.MyEvent())

```

### Cloning
- [x] Run `git clone https://github.com/SnoopyCodeX/snoopbot-v2` in your terminal
- [x] Then type `cd snoopbot-v2`

### Deploying Locally
> **Before anything**, you must create a facebook dummy account for your chatbot first.
But this is only (**optional**), you could always use your main account but **I will not**
**be responsible** if your account gets **banned** or **muted** by facebook.

- [x] First, rename `.env.development` to `.env`
- [x] Open `.env` file and fill in your facebook `email` and `password` like so:

```javascript
FB_EMAIL=yourfacebookemail@gmail.com
FB_PASS=yourfacebookpassword
```

- [x] Lastly, open terminal in the chatbot's root directory where the `package.json` resides
- [x] Run `npm install` to install all the dependencies of this chatbot **IF YOU HAVEN'T** ran this command yet
- [x] Then run `npm run start`

### Credits
- [@Jerson Carin](https://github.com/jersoncarin)
- [@Unofficial FCA](https://github.com/VangBanLaNhat/fca-unofficial)

### Disclaimer
```
This bot is made for educational purposes only!
I am not responsible for any misuse, damages or
problems that you may cause for using and/or modifying
this source code to do unethical things.
```
------------------
