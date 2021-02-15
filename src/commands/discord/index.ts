import { Command, Context } from "@samipourquoi/commander";
import { Message, MessageEmbed } from "discord.js";
import { HelpCommand } from "./help";
import { OnlineCommand } from "./online";

export class DiscordDispatcher
	extends Command {

	constructor() {
		super();

		this.register
			.with.attach(new HelpCommand())
			.or.attach(new OnlineCommand());
	}
}

export type DiscordContext = Context<DiscordClosure>

export type DiscordClosure = {
	message: Message,
}
