# SnoopBot :robot:

**SnoopBot v2** is a **facebook messenger chatbot** that is made
using **NodeJS**, **Typescript** and the **Unofficial Facebook Chat API**.
------------------
### Automatic Bot Tasks
- [x] **Unsend Detection** : Detects an unsent message or attachment and resends it back to the thread.
- [x] **Auto Greet** : Sends a welcome or farewell message when a person joins or leaves a thread.

### Commands Available
**Default Prefix**: /
- [x] `/help` : Displays the list of all available commands in this bot.
- [x] `/info` : Displays info about SnoopBot.
- [x] `/say <language> <phrase>` : Sends an audio synthesis of the phrase.
- [x] `/say languages-list` : Lists all the supported languages.
- [x] `/translate <phrase or word> to <language>` : Translates a phrase or word to a specified language.
- [x] `/downloadTiktok <tiktok video url>` : Downloads a tiktok video from the specified tiktok url.
- [x] `/play <song title>` : Sends an audio of the song and the lyrics of the song to the convo.
- [x] `/define <word>` : Sends the definition of the word.
- [x] `/wiki <query>` : Searches the wiki for your query.
- [x] `/ris <Optional: image-url>` : Performs a Reverse Image Search.
- [x] `/imageSearch <query>` : Search for images in google.

### Admin Commands
- [x] `/admin <promote|demote|list> <@person [, @person2, ..] | @you>` : Promote/Demote/List admins for this chatbot in a specific thread.
- [x] `/pin <add|remove|purge|get|list> <name>` : Add/Remove/Get/List pinned message in a thread.
- [x] `/join` : Allows the bot to respond to commands that are sent by non-admin users in a thread.
- [x] `/leave` : Tells the bot to ignore all commands that are sent by non-admin users in a thread.
- [x] `/permission grant <command | all> <@person | @all>` : Grants permission to all or a specific command to all or a specific person.
- [x] `/permission revoke <command | all> <@person | @all>` : Revokes permission to all or a specific command to all or a specific person.
- [x] `/settings <settings> <option>` : Updates bot's settings in a current thread.
- [x] `/settings list` : Lists the current settings of the bot in a current thread.

### Cloning
- [x] Run `git clone https://github.com/SnoopyCodeX/snoopbot-v2` in your terminal
- [x] Then type `cd snoopbot-v2`

### Deploying Locally
**Before anything**, you must create a facebook dummy account for your chatbot first.
But this is only (**optional**), you could always use your main account but **I will not**
**be responsible** if your account gets **banned** or **muted** by facebook.
- [x] First, rename `.env.development` to `.env`
- [x] Second, install [this extension](https://github.com/c3cbot/c3c-fbstate) to your chrome or kiwi(if you're using mobile phone)
- [x] Third, open facebook in your chrome (or kiwi if you're using mobile phone) and login to your chatbot's account.
- [x] Fourth, while you're on facebook, open the extension that you installed earlier on your chrome (or kiwi if you're using mobile phone).
- [x] Copy the json string that is shown by the extension
- [x] Then using an online json minifier tool, minify the json string that you copied
- [x] Next, open `.env` file and put the value in `APPSTATE=`, **EG:** `APPSTATE='your minified json string here'` then save it.
- [x] Lastly, open terminal in the chatbot's root directory where the `package.json` resides
- [x] Run `npm install` to install all the dependencies of this chatbot **IF YOU HAVEN'T** ran this command yet

- [x] Run `npm run start`

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
