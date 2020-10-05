"use strict";

const Command = require("../Command.js");

class Ping extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Ping",
			"usage": "ping",
			"description": "Check if the bot is online"
		};
	}

	run(message) {
		message.channel.send("Pong!");
	}
}

module.exports = Ping;
