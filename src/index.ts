import SnoopBot from "./core/snoopbot"
import * as commands from "./commands"

const bot = new SnoopBot()
bot.init()

bot.addCommand(new commands.HelpCommand())