import { Command, Context } from "@samipourquoi/commander";
import { Message, MessageEmbed } from "discord.js";
import { DiscordCommands } from "./discord";

export class Dispatcher
	extends Command {

	constructor() {
		super();

		this.register
			.with.attach(new DiscordCommands());
	}
}

export type CommandContext = Context<Closure>

export type Closure = {
	message: Message,
}
