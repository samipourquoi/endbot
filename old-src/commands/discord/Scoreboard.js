"use strict";

const { createCanvas, registerFont } = require("canvas");

const Command = require("../Command");

const scoreboards = require("../../../assets/scoreboards.json");

const WHITE = "#fff";
const LIGHT_GREY = "#A0A0A0";
const GREY = "#36393F";
const RED = "#EB5353";

const SPACE_BETWEEN = 2;
const MARGIN = 10;
const OBJECTIVE_NAME_SPACE = 9;
const FONT_SIZE = 22;

class Scoreboard extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Scoreboard",
			"usage": "scoreboard <objective> --all",
			"alias": "s",
			"description": "Creates an image of the ingame scoreboard associated to that objective, for all whitelisted players"
		};
	}

	async run(message, args) {
		if (args.length == 0) {
			let embed = this.client.errorEmbed("args")
				.setDescription("Correct usage:\n" + this.info.usage);

			await message.channel.send(embed);
			return;
		}
		let rcon = this.client.bridges.get(this.client.config.servers[0]["bridge-channel"]).rcon;
		let objective = args[0];
		// eslint-disable-next-line no-prototype-builtins
		let scores = await this.getData(rcon, (scoreboards.hasOwnProperty(args[0])) ? scoreboards[args[0]] : args[0], (args[1] == "all"));

		let canvas = createCanvas(300, (FONT_SIZE+SPACE_BETWEEN)*scores.length + MARGIN*3 + OBJECTIVE_NAME_SPACE);
		registerFont(".//assets/minecraft.otf", { family: "Minecraft" });
		let context = canvas.getContext("2d");

		context.font = FONT_SIZE + "px Minecraft";

		// Background
		context.fillStyle = GREY;
		context.fillRect(0, 0, canvas.width, canvas.height);

		// Objective name
		context.fillStyle = WHITE;
		let objectiveNameWidth = context.measureText(objective).width;
		context.fillText(objective, canvas.width/2 - objectiveNameWidth/2, FONT_SIZE + MARGIN/2);

		// Names
		context.fillStyle = LIGHT_GREY;
		for (let i = 0; i < scores.length; i++) {
			let name = scores[i][0];
			if (name == "Total") context.fillStyle = WHITE;
			context.fillText(name, MARGIN, (FONT_SIZE+SPACE_BETWEEN)*(i+1) + MARGIN * 2 + OBJECTIVE_NAME_SPACE);
		}

		// Scores
		context.fillStyle = RED;
		for (let i = 0; i < scores.length; i++) {
			let score = scores[i][1];
			let scoreWidth = context.measureText(score).width;
			context.fillText(score, canvas.width - MARGIN - scoreWidth, (FONT_SIZE+SPACE_BETWEEN)*(i+1) + MARGIN*2 + OBJECTIVE_NAME_SPACE);
		}

		// Send image
		let buffer = canvas.toBuffer();
		await message.channel.send({
			files: [buffer]
		});
	}

	async getData(rcon, objective, all) {
		let players = await this.getPlayers(rcon, all);

		// Get scores for each player
		let scores = [];
		for (let i = 0; i < players.length; i++) {
			let player = players[i];
			let data = await rcon.sendCommand(`scoreboard players get ${player} ${objective}`);
			if (data.body.includes("Can't get value of")) continue;
			if (data.body.includes("Unknown scoreboard objective")) break;
			let scoreString = data.body.split(" ")[2];
			if (isNaN(+scoreString)) continue;
			scores.push([player, +scoreString]);
		}

		scores.sort((a, b) => {
			return b[1]-a[1];
		});

		scores.push([
			"Total",
			(scores.length == 0) ? 0 : String(scores.reduce((a, b) => {
				return a + parseInt(b[1]);
			}, 0))
		]);

		return scores;
	}

	async getPlayers(rcon, all) {
		let data;
		if (all) {
			data = await rcon.sendCommand("scoreboard players list");
		} else {
			data = await rcon.sendCommand("whitelist list");
		}

		let temp = data.body.split(", ");
		let head = temp[0]
			.split(" ")
			.pop()
		return [ head, ...temp ];
	}
}

module.exports = Scoreboard;
