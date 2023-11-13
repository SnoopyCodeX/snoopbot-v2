import { SnoopBot } from "./snoopbot"
import * as commands from "./commands"
import * as events from "./events"

const bot = new SnoopBot()
bot.init({
    selfListen: true,
    debugMode: true,
})

bot.on('gc:member_join', new events.MemberJoinEvent())
bot.on('gc:member_leave', new events.MemberLeaveEvent())
bot.on('message:unsend', new events.MessageUnsendEvent())

bot.addCommand(new commands.HelpCommand())
bot.addCommand(new commands.PlayCommand())
bot.addCommand(new commands.ReverseImageSearchCommand())