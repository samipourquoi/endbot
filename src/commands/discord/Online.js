"use strict";

const Command = require("../Command.js");

class Online extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Online",
			"usage": "online",
			"description": "Sends the list of all online players across servers"
		};
	}

	async run(message) {
		let servers = this.client.config.servers;
		let keys = Object.keys(servers);
		for (let i = 0; i < keys.length; i++) {
			let server = servers[keys[i]];

			if (server["bridge-channel"] == message.channel.id) {
				let rcon = this.client.bridges.get(message.channel.id).rcon;
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

				console.log(online);

				let embed = this.client.createEmbed("result")
					.setTitle("Online players on " + rcon.name)
					.addField(`${online.onlineCount}/${online.maxCount}`, online.players);

				message.channel.send(embed);
				return;
			}
		}

		// TODO: Add global online, not only in bridge channels

		await message.channel.send(this.client.errorEmbed("bridge"));
	}

	toString() {
		return this.info;
	}
}

module.exports = Online;
