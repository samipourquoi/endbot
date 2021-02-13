import { Command } from "@samipourquoi/commander";
import { HelpCommand } from "./help";

export class DiscordCommands
	extends Command {

	constructor() {
		super();

		this.register
			.with.attach(new HelpCommand())
	}
}