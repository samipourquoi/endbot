import { CommandNotFoundEmbed, ErrorEmbed, InvalidPermissionsEmbed } from "../lib/embeds.js";
import { Command } from "./command.js";
import { ICommandContext } from "../lib/interfaces.js";

export class CommandHandler {
    private commands: Command[] = [];

    addCommand(command: Command): void {
        this.commands.push(command);
    }

    async handleCommand(cmdContext: ICommandContext): Promise<void> {
        const cmdName = cmdContext.cmdName;
        for (const command of this.commands) {
            if (command.name === cmdName || command.aliases.includes(cmdName)) {
                await this.runCommand(command, cmdContext);
                return;
            }
        }

        cmdContext.channel.send({ embeds: [new CommandNotFoundEmbed(cmdName)] });
    }

    private async runCommand(command: Command, cmdContext: ICommandContext): Promise<void> {
        if (!(await command.hasPermission(cmdContext.author))) {
            cmdContext.channel.send({ embeds: [new InvalidPermissionsEmbed(command.name)] });
            return;
        }

        try {
            await command.run(cmdContext);
        } catch (e: any) {
            const errorMsg = `Error running command '${command.name}': ${e.message}`;
            cmdContext.channel.send({ embeds: [new ErrorEmbed(errorMsg)] });
        }
    }
}

export const commandHandler = new CommandHandler();

export function discordCommand(constructor: new () => Command): void {
    commandHandler.addCommand(new constructor());
}
