import { Client, Message } from "discord.js";

export class Endbot
	extends Client {

	constructor() {
		super();

		this.on("message", this.filter)
		this.once("ready", () => console.info(`Logged on as ${this.user?.username}`));
	}

	async filter(message: Message) {
		if (message.author.bot) return;
		console.log(message.content);
	}
}