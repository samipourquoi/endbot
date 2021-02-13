import { Client, Message, MessageEmbed } from "discord.js";
import { Closure, CommandContext, Dispatcher } from "./commands";
import { Colors } from "./theme";

export class Endbot
	extends Client {

	dispatcher: Dispatcher;
	prefix: string;

	constructor() {
		super();

		this.dispatcher = new Dispatcher();
		this.prefix = "!";

		this.on("message", this.filter)
		this.once("ready", () => console.info(`Logged on as ${this.user?.username}`));
	}

	async filter(message: Message) {
		if (message.author.bot) return;

		// Checks prefix
		if (!message.content.startsWith(this.prefix)) return;

		const closure: Closure = { message };

		try {
			this.dispatcher.run(
				message.content.slice(this.prefix.length),
				closure
			);
		} catch (e) {
			const error = new MessageEmbed()
				.setColor(Colors.ERROR)
				.setDescription(e);
			await message.channel.send(error);
		}
	}
}