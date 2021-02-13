"use strict";

const ServerCommand = require("../ServerCommand");

class Pos extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Position",
			"usage": "pos [player]",
			"description": "Sends players postion in chat"
		};
	}

	async run(rcon, authorName, args) {
		if (args[0] == undefined) args[0] = authorName;

		let playersOnline = await rcon.sendCommand("list");
		if ((playersOnline.body).includes(args[0])) {
			let playerX = (((await rcon.sendCommand(`data get entity ${args[0]} Pos[0] 1`)).body).split(" "))[9];
			let playerY = (((await rcon.sendCommand(`data get entity ${args[0]} Pos[1] 1`)).body).split(" "))[9];
			let playerZ = (((await rcon.sendCommand(`data get entity ${args[0]} Pos[2] 1`)).body).split(" "))[9];
			let playerDimension = (((await rcon.sendCommand(`data get entity ${args[0]} Dimension`)).body).split(" "))[6];
            
			let position = `${args[0]} is at X:${playerX} Y:${playerY} Z:${playerZ} in ${playerDimension.replace("\"", "")}`;
			let message = `{"text":"${position.replace("\"", "")}","color": "aqua"}`;
            
			await rcon.sendCommand(`effect give ${args[0]} minecraft:glowing 30`);
			await rcon.sendCommand("tellraw @a " + `${message}`);
		}
		else {
			rcon.error("That player is not online");
		}
	}
}
module.exports = Pos;
