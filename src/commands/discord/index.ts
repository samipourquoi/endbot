import { Command } from "@samipourquoi/commander";
import { HelpCommand } from "./help";
import { OnlineCommand } from "./online";

export class DiscordCommands
	extends Command {

	constructor() {
		super();

		this.register
			.with.attach(new HelpCommand())
			.or.attach(new OnlineCommand());
	}
}