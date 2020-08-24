"use strict";

const Command = require("../Command.js");

class Online extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Online",
			"usage": "online [--all]",
			"description": "Sends the list of all online players across servers"
		};
	}

	async run(message, args) {
		if (args[0] == "--all") {
			let iterator = this.client.bridges.entries();
			for (let i = 0; i < this.client.bridges.size; i++) {
				let bridge = iterator.next().value[1];
				await message.channel.send(await this.getOnlinePlayers(bridge.rcon));
			}
			return;
		}

		let servers = this.client.config.servers;
		let keys = Object.keys(servers);
		for (let i = 0; i < keys.length; i++) {
			let server = servers[keys[i]];

			if (server["bridge-channel"] == message.channel.id) {
				let rcon = this.client.bridges.get(message.channel.id).rcon;
				await message.channel.send(await this.getOnlinePlayers(rcon));
				return;
			}
		}

		await message.channel.send(this.client.errorEmbed("bridge"));

		// TODO: Add global online, not only in bridge channels
	}

	async getOnlinePlayers(rcon) {
		let data = await rcon.sendCommand("list");
		let response = data.body.split(" ");
		let online = {
			onlineCount: response[2],
			maxCount: response[6],
			players: response.slice(9)
		};

		if (online.players[0] == "") {
			online.players = "No online players";
		}

		let embed = this.client.createEmbed("result")
			.setTitle("Online players on " + rcon.name)
			.addField(`${online.onlineCount}/${online.maxCount}`, online.players);

		return embed;
	}

	toString() {
		return this.info;
	}
}

module.exports = Online;
