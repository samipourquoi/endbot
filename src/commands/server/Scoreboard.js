"use strict";

const ServerCommand = require("../ServerCommand");

const everyScoreboard = require("../../assets/scoreboards.json");

class Scoreboard extends ServerCommand {
	constructor(client, rcon) {
		super(client, rcon);
		this.info = {
			"name": "Scoreboard",
			"usage": "scoreboard <objective> [query <player>]",
			"description": "Displays a scoreboad in game."
		};
	}

	run(authorName, args) {
		if (args.length == 1) {
			let scoreboard = everyScoreboard[args[0]];
			if (scoreboard == undefined) scoreboard = args[0];

			this.rcon.sendCommand(`scoreboard objectives setdisplay sidebar ${scoreboard}`)
				.then(data => {
					if (data.body.includes("Unknown scoreboard objective")) {
						this.rcon.error("Unknown scoreboard objective '", args[0], "'");
						// TODO: Autocomplete
					}
				});
		} else if (args[1] == "query") {
			let player = args[2];
			let objective = args[0];
			if (player == undefined) {
				this.rcon.error("Missing argument: scoreboard query <player>");
			} else {
				this.query(player, objective);
			}
		} else if (args[2] == "total") {
			// TODO: scoreboard <objective> total
		} else {
			// TODO: Error command
		}
	}

	query(player, objective) {
		this.rcon.sendCommand(`scoreboard players get ${player} ${objective}`)
			.then(data => {
				this.rcon.succeed(data.body);
			});
	}
}

module.exports = Scoreboard;
