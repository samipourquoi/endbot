"use strict";

const Command = require("@root/src/commands/Command.js");

class Ping extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Ping",
			"usage": "ping",
			"description": "Check if the bot is online"
		};
	}

	async run(message) {
		await message.channel.send("Pong!");
	}
}

module.exports = Ping;
