import { Client, Intents, Message } from "discord.js";
import { Config } from "./interfaces.js";

export class Endbot extends Client {
	config: Config;

	constructor(config: Config) {
		super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

		this.config = config;

		this.login(config.token);

		this.on("messageCreate", this.handleMessage);
		this.once("ready", async () => {
			console.log("ready");
		})
	}

	handleMessage(message: Message) {
		if (message.author.bot) return;

		console.log(message.content);
	}
}
