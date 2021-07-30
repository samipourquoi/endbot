import { Client, Message, MessageEmbed, TextChannel } from "discord.js";
import { Bridge, Bridges } from "./bridge/bridge";
import { Webhook } from "./bridge/webhook";
import { Tails } from "./bridge/tail";
import { config } from "./index";
import { discord } from "./commands/dispatcher";
import { DiscordClosure } from "./commands/dispatcher";
import * as Models from "./models";
import { Embed } from "./utils/embeds";

export class Endbot
	extends Client {

	prefix: string;

	constructor() {
		super();

		this.prefix = "!";

		this.on("message", this.filter)
		this.once("ready", async () => {
			await Models.sync();
			await this.initServers();
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
			await discord.run(
				message.content.slice(this.prefix.length),
				closure
			);
		} catch (e) {
			await message.channel.send(Embed.error("", e));
		}
	}

	async initServers() {
		if (config.servers == null || config.servers.length == 0) {
			console.log("Setup your server in the config file to connect to your server")
		 	return;
		}
		let local_server = false;

		for (const server of config.servers) {
			const channel = await this.channels
				.fetch(server.bridge_channel.toString());
			const bridge = new Bridge(server, channel as TextChannel);
			await bridge.connect();
			if (server.is_local) {
				Tails.init(server);
				local_server = true;
			}
		}
		if (!local_server) Webhook.init();
	}
}
