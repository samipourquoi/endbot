"use strict";

const ServerCommand = require("../ServerCommand");

const everyScoreboard = require("../../assets/scoreboards.json");

class Scoreboard extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Scoreboard",
			"usage": "scoreboard <objective> [query <player>]",
			"description": "Displays a scoreboad in game."
		};
	}

	run(rcon, authorName, args) {
		if (args.length == 1) {
			let scoreboard = everyScoreboard[args[0]];
			if (scoreboard == undefined) scoreboard = args[0];

			rcon.sendCommand(`scoreboard objectives setdisplay sidebar ${scoreboard}`)
				.then(data => {
					if (data.body.includes("Unknown scoreboard objective")) {
						rcon.error(data.body);
						// TODO: Autocomplete
					}
				});
		} else if (args[1] == "query") {
			let player = args[2];
			let objective = args[0];
			if (player == undefined) {
				rcon.error("Missing argument: scoreboard query <player>");
			} else {
				this.query(rcon, player, objective);
			}
		} else if (args[2] == "total") {
			// TODO: scoreboard <objective> total
		} else {
			rcon.error(`Incorrect arguments. Correct usage: ${this.info.usage}`);
		}
	}

	query(rcon, player, objective) {
		rcon.sendCommand(`scoreboard players get ${player} ${objective}`)
			.then(data => {
				if (data.body.includes("Can't get value of") || data.body.includes("Unknown scoreboard objective")) {
					rcon.error(data.body);
				} else {
					rcon.succeed(data.body);
				}
			});
	}
}

module.exports = Scoreboard;
