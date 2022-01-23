import { Command } from "./lib/command";

export class CommandHandler {
	commands: Command[] = [];

	addCommand(command: Command): void {
		this.commands.push(command);
	}
}

export const commandHandler = new CommandHandler();

export function discordCommand(constructor: new () => Command): void {
	commandHandler.addCommand(new constructor());
}
