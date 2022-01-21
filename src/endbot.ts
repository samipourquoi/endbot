import { Client, Intents, Message } from "discord.js";
import { IConfig } from "./interfaces";

export class Endbot extends Client {
	config: IConfig;

	constructor(config: IConfig) {
		super({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
		});

		this.config = config;

		this.login(config.token).catch(console.error);

		this.on("messageCreate", this.handleMessage);
		this.once("ready", async () => {
			console.log("ready");
		});
	}

	handleMessage(message: Message): void {
		if (message.author.bot) return;

		console.log(message.content);
	}
}
