"use strict";

const ServerCommand = require("../ServerCommand");

class Scoreboard extends ServerCommand {
	constructor(client, rcon) {
		super(client, rcon);
		this.info = {
			"name": "Scoreboard",
			"usage": "scoreboard <objective> [query <player>|total]",
			"description": "Displays a scoreboad in game."
		};
	}

	run(authorName, ...args) {
	}
}

module.exports = Scoreboard;
