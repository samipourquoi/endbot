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
		for (let i = 0; i < keys.length; i++) {
			let info = commands[keys[i]].info;
			let name = `{"text":"${info.name}","color":"gray","hoverEvent":{"action":"show_text","value":"${info.description}"}}`;
			let usage = `{"text":": ${info.usage}", "color": "white"}`;
			help.push(`${name}, ${usage}`);
		}

		let message = "[\"\"," + help.join(",\"\\n\",") + "]";
		console.log(`tellraw @a ${message}`);
		rcon.sendCommand("tellraw @a " + message);
	}
}

module.exports = Help;
