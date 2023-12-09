import 'module-alias/register'
import { SnoopBot } from "@snoopbot"

// Initialize SnoopBot
const bot = new SnoopBot()
bot.init({
    selfListen: true,
    debugMode: true,
})