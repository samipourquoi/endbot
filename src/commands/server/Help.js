"use strict";

const ServerCommand = require("../ServerCommand");

class Help extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Help",
			"usage": "help",
			"description": "Send a help pannel on the server."
		};
	}

	run(rcon) {
		let help = [];

		let commands = this.client.serverCommands;
		let keys = Object.keys(commands);
		for (let i = 0; i < commands.length; i++) {
			let command = commands[keys[i]];
			let name = `{"text:"${command.name}","hoverEvent":{"action":"show_text","value":"${command.description}"}}`;
			help.push(`${name}, ": ", "${command.usage}"`);
		}

		let message = help.join(",\"\n\",");
		console.log(message);
		this.rcon.sendMessage(message);
	}
}

module.exports = Help;
