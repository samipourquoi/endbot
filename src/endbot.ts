import { Client, Message, MessageEmbed, TextChannel } from "discord.js";
import { Colors } from "./utils/theme";
import { Bridge, Bridges } from "./bridge/bridge";
import { Webhook } from "./bridge/webhook";
import { Database } from "./database";
import { config } from "./index";
import { discord } from "./commands/dispatcher";
import { DiscordClosure } from "./commands/dispatcher";
import { Web } from "./web";

export class Endbot
	extends Client {

	prefix: string;

	constructor() {
		super();

		this.prefix = "!";

		this.on("message", this.filter)
		this.once("ready", async () => {
			await Database.init();
			await this.initServers();
			await Web.init();
			console.info(`Logged on as ${this.user?.username}`)
		});
	}

	async filter(message: Message) {
		if (message.author.bot) return;

		const bridges = Bridges.getFromMessage(message);
		await bridges.forEach(bridge => {
			bridge.emit("discord", message);
		});

		// Checks prefix
		if (!message.content.startsWith(this.prefix)) return;

		const closure: DiscordClosure = { message };

		try {
			discord.run(
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
		for (const server of config.servers) {
			const channel = await this.channels
				.fetch(server.bridge_channel.toString());
			const bridge = new Bridge(server, channel as TextChannel);
			await bridge.connect();
		}
		Webhook.init();
	}
}