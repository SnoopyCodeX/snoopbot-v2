#! /usr/bin/env node

/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2023, SnoopyCodeX
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { program, Option } from "@commander-js/extra-typings"
import { File } from "buffer"
import chalk from "chalk"
import { existsSync,  readFileSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import _ from "lodash"

const createCommand = async (name: string) => {
    let className = _.upperFirst(_.camelCase(name))
    
    if((/^[0-9]+/g).test(className)) {
        console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Invalid command name '${name}'. Command name must not start with a number!` + '\n\n')
        return
    }

    if(!className.endsWith('Command'))
        className += 'Command'

    let commandsDir = `${process.cwd()}/src/commands`
    let newCommandsFile = `${commandsDir}/${name}.ts`
    let templateCommandFile = `${process.cwd()}/src/snoopbot/cli/templates/snoopbot-command.template.ts`
    let exportCommandFile = `${commandsDir}/index.ts`

    if(!existsSync(commandsDir))
        await mkdir(commandsDir, { recursive: true });

    if(existsSync(newCommandsFile)) {
        console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Command '${name}' already exists!` + '\n\n')
        return
    }

    let templateCommandCode = readFileSync(templateCommandFile).toString('utf-8')
    templateCommandCode = templateCommandCode
        .replace('<NAME>', className)
        .replace(/(\<options\-NAME\>)/g, name)

    if(!existsSync(exportCommandFile))
        new File([""], exportCommandFile, {type: "application/typescript"});

    let templateExportCommandCode = readFileSync(exportCommandFile).toString('utf-8');
    templateExportCommandCode += `${templateExportCommandCode.length === 0 ? '' : '\n'}export { default as ${className} } from '@commands/${name}'`;

    await writeFile(newCommandsFile, templateCommandCode);
    await writeFile(exportCommandFile, templateExportCommandCode);
    console.log('\n\n' + chalk.bgGreenBright.white` SnoopBot CLI ` + chalk.reset.greenBright` Successfully created new command ${newCommandsFile}` + '\n\n')
}

const createEvent = async (name: string) => {
    let className = _.upperFirst(_.camelCase(name))

    if((/^[0-9]+/g).test(className)) {
        console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Invalid event name '${className}'. Event name must not start with a number!` + '\n\n')
        return
    }

    if(!className.endsWith('Event'))
        className += 'Event'

    let eventsDir = `${process.cwd()}/src/events`
    let newEventFile = `${eventsDir}/${name.toLowerCase()}.ts`
    let templateEventFile = `${process.cwd()}/src/snoopbot/cli/templates/snoopbot-event.template.ts`
    let exportEventFile =   `${eventsDir}/index.ts`

    if(!existsSync(eventsDir))
        await mkdir(eventsDir, { recursive: true });

    if(existsSync(newEventFile)) {
        console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Event '${className}' already exists!` + '\n\n')
        return
    }

    if(!existsSync(exportEventFile))
        new File([""], exportEventFile, {type: "application/typescript"})

    let templateEventCode = readFileSync(templateEventFile).toString("utf-8")
    templateEventCode = templateEventCode.replace('<NAME>', className)

    let templateExportEventCode = readFileSync(exportEventFile).toString("utf-8")
    templateExportEventCode += `${templateExportEventCode.length === 0 ? '' : '\n'}export { default as ${className} } from '@events/${name.toLowerCase()}'`

    await writeFile(newEventFile, templateEventCode)
    await writeFile(exportEventFile, templateExportEventCode)
    console.log('\n\n' + chalk.bgGreenBright.white` SnoopBot CLI ` + chalk.reset.greenBright` Successfully created new event ${newEventFile}` + '\n\n')
}

const createMiddleware = async (name: string) => {
    let className = _.upperFirst(_.camelCase(name))

    if((/^[0-9]+/g).test(className)) {
        console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Invalid middleware name '${className}'. Middleware name must not start with a number!` + '\n\n')
        return
    }

    if(!className.endsWith('Middleware'))
        className += 'Middleware'

    let middlewaresDir = `${process.cwd()}/src/middlewares`
    let newMiddlewareFile = `${middlewaresDir}/${name.toLowerCase()}.ts`
    let templateMiddlewareFile = `${process.cwd()}/src/snoopbot/cli/templates/snoopbot-middleware.template.ts`
    let exportMiddlewareFile =   `${middlewaresDir}/index.ts`

    if(!existsSync(middlewaresDir))
        await mkdir(middlewaresDir, { recursive: true });

    if(existsSync(newMiddlewareFile)) {
        console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Event '${className}' already exists!` + '\n\n')
        return
    }

    if(!existsSync(exportMiddlewareFile))
        new File([""], exportMiddlewareFile, {type: "application/typescript"})

    let templateEventCode = readFileSync(templateMiddlewareFile).toString("utf-8")
    templateEventCode = templateEventCode.replace('<NAME>', className)

    let templateExportEventCode = readFileSync(exportMiddlewareFile).toString("utf-8")
    templateExportEventCode += `${templateExportEventCode.length === 0 ? '' : '\n'}export { default as ${className} } from '@middlewares/${name.toLowerCase()}'`

    await writeFile(newMiddlewareFile, templateEventCode)
    await writeFile(exportMiddlewareFile, templateExportEventCode)
    console.log('\n\n' + chalk.bgGreenBright.white` SnoopBot CLI ` + chalk.reset.greenBright` Successfully created new middleware ${newMiddlewareFile}` + '\n\n')
}

program
    .description('Create a new command/event/middleware')
    .name('@snoopbot')
    .command('cli')
    .addOption(new Option('-a, --action <ACTION>', 'The action you want to do').choices(['create:command', 'create:event', 'create:middleware'] as const))
    .addOption(new Option('-n, --name <NAME>', 'The name of the file'))
    .action((options) => {
        let action = options.action!
        let name = options.name!

        switch(action) {
            case "create:command":
                createCommand(name)
                break

            case "create:event":
                createEvent(name)
                break

            case "create:middleware":
                createMiddleware(name)
                break

            default:
                console.log('\n\n' + chalk.bgRedBright.white.bold` SnoopBot CLI ` + chalk.reset.redBright` Unknown action '${action}'!` + '\n\n');
        }
    })

program.parse(process.argv);