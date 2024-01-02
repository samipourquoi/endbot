import { CommandNotFoundEmbed, InvalidPermissionsEmbed } from "./lib/embeds.js";
import { EmbedBuilder, GuildMember } from "discord.js";
import { Command } from "./lib/command.js";

export class CommandHandler {
    private commands: Command[] = [];

    addCommand(command: Command): void {
        this.commands.push(command);
    }

    async runCommand(
        commandName: string,
        args: string[],
        author: GuildMember,
    ): Promise<EmbedBuilder> {
        for (const command of this.commands) {
            if (command.name === commandName || command.aliases.includes(commandName)) {
                return (await command.hasPermission(author))
                    ? await command.run(args)
                    : new InvalidPermissionsEmbed(commandName);
            }
        }

        return new CommandNotFoundEmbed(commandName);
    }
}

export const commandHandler = new CommandHandler();

export function discordCommand(constructor: new () => Command): void {
    commandHandler.addCommand(new constructor());
}
