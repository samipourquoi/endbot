"use strict";

const ServerCommand = require("../ServerCommand");

class Help extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Help",
			"usage": "help",
			"description": "Send a help pannel on the server"
		};
	}

	run(rcon) {
		let help = [];

		let addedCommands = []; // To prevent duplicates
		let commands = this.client.serverCommands;
		let keys = Object.keys(commands);
		for (let i = 0; i < keys.length; i++) {
			let command = commands[keys[i]];
			if (addedCommands.includes(command.description)) continue;
			let name = `{"text":"${command.name}","color":"gray","hoverEvent":{"action":"show_text","value":"${command.description}"}}`;
			let usage = `{"text":": ${command.usage}", "color": "white"}`;
			help.push(`${name}, ${usage}`);
			addedCommands.push(command.description);
		}

		let message = "[\"\"," + help.join(",\"\\n\",") + "]";
		rcon.sendCommand("tellraw @a " + message);
	}
}

module.exports = Help;
