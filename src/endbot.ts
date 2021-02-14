import { Client, Message, MessageEmbed, TextChannel } from "discord.js";
import { Closure, CommandContext, Dispatcher } from "./commands";
import { Colors } from "./theme";
import { Config } from "./config";
import { Bridge, Bridges } from "./bridge";

export class Endbot
	extends Client {

	dispatcher: Dispatcher;
	prefix: string;
	config: Config.Config;

	constructor() {
		super();

		this.dispatcher = new Dispatcher();
		this.prefix = "!";
		this.config = Config.init();

		this.on("message", this.filter)
		this.once("ready", () => {
			this.initServers();
			console.info(`Logged on as ${this.user?.username}`)
		});
	}

	async filter(message: Message) {
		if (message.author.bot) return;

		const bridge = Bridges.getFromMessage(message);
		if (bridge) {
			await bridge.onDiscordMessage(message);
		}

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

	async initServers() {
		for (const server of this.config.servers) {
			const channel = await this.channels
				.fetch(server.bridge_channel.toString());
			const bridge = new Bridge(server, channel as TextChannel);
			await bridge.connect();
		}
	}
}