import { Client, Intents, Message } from "discord.js";

export class Endbot extends Client {
	constructor() {
		super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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
