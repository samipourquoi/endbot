"use strict";

const Command = require("../Command.js");

class Pos extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Pos",
			"usage": "pos <playername>",
			"description": "Gets the position of a player"
		};
	}

	async run(message, args) {
		let rcon;
		let servers = this.client.config.servers;
		let keys = Object.keys(servers);

		for (let i = 0; i < keys.length; i++) {
			let server = servers[keys[i]];
			if (server["bridge-channel"] == message.channel.id) rcon = this.client.bridges.get(message.channel.id).rcon;
		}

		let playersOnline = await rcon.sendCommand("list");
		if ((playersOnline.body).includes(args[0])) {
			await message.channel.send(`***cpp\n${await this.playerPos(rcon, args)}~~~`.replace("***", "```").replace("~~~", "```"));
		} else {
			await message.channel.send("Who da fuck are you talkin about?");
		}
	}
    
	async playerPos(rcon, args) {

		let playerX = (((await rcon.sendCommand(`data get entity ${args[0]} Pos[0] 1`)).body).split(" "))[9];
		let playerY = (((await rcon.sendCommand(`data get entity ${args[0]} Pos[1] 1`)).body).split(" "))[9];
		let playerZ = (((await rcon.sendCommand(`data get entity ${args[0]} Pos[2] 1`)).body).split(" "))[9];
		let playerDimension = (((await rcon.sendCommand(`data get entity ${args[0]} Dimension`)).body).split(" "))[6];
            
		let position = `${args[0]} is at X:${playerX} Y:${playerY} Z:${playerZ} in ${playerDimension.replace("\"", "")}`;

		return position.replace("\"", "");
	}
}
module.exports = Pos;
