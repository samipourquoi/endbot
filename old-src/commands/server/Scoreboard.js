"use strict";

const ServerCommand = require("../ServerCommand");

const everyScoreboard = require("../../../assets/scoreboards.json");

class Scoreboard extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Scoreboard",
			"usage": "scoreboard <objective>|clear> [list|total|query <player>]",
			"alias": "s",
			"description": "Displays a scoreboad in game"
		};
	}

	async run(rcon, authorName, args) {
		if (args.length == 1 || args[1] == "list") {
			let scoreboard = everyScoreboard[args[0]];
			if (scoreboard == undefined) scoreboard = args[0];
			let mode = (args[1] == "list") ? "list" : "sidebar";

			if (scoreboard == "clear") {
				await rcon.sendCommand(`scoreboard objectives setdisplay ${mode}`);
				await rcon.succeed(`Cleared the ${mode} from any objective`);
				rcon.preset.enabled = false;
				return;
			}

			rcon.sendCommand(`scoreboard objectives setdisplay ${mode} ${scoreboard}`)
				.then(data => {
					if (data.body.includes("Unknown scoreboard objective")) {
						rcon.error(data.body);
						// TODO: Autocomplete
					} else {
						rcon.preset.enabled = false;
					}
				});
		} else if (args[1] == "query") {
			let player = args[2];
			let objective = everyScoreboard[args[0]];
			if (objective == undefined) objective = args[0];
			if (player == undefined) {
				rcon.error("Missing argument: scoreboard query <player>");
			} else {
				this.query(rcon, player, objective);
			}
		} else if (args[1] == "total") {
			let players = await this.getWhitelist(rcon);
			let objective = everyScoreboard[args[0]];
			if (objective == undefined) objective = args[0];
			let scores = [];
			for (let i = 0; i < players.length; i++) {
				let player = players[i];
				let data = await rcon.sendCommand(`scoreboard players get ${player} ${objective}`);
				if (data.body.includes("Can't get value of")) continue;
				if (data.body.includes("Unknown scoreboard objective")) break;
				scores.push(data.body.split(" ")[2]);
			}
			let total = scores.reduce((a, b) => a + parseInt(b), 0);
			await rcon.succeed(`The total of ${objective} is of ${total}`);

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

	async getWhitelist(rcon) {
		let data = await rcon.sendCommand("whitelist list");
		let players = data.body.substring(data.body.indexOf(":")+2).split(", ");
		return players;
	}
}

module.exports = Scoreboard;
