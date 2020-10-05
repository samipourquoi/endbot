"use strict";

const Discord = require("discord.js");

const Command = require("../Command.js");

/**
 * @author Jezzers
 */
class Mspt extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Mspt",
			"usage": "mspt [--all]",
			"alias": "tps",
			"description": "Sends the mspt and tps the game is running at"
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

		if (args[0] == "--all" || rcon == undefined) {
			let iterator = this.client.bridges.entries();
			for (let i = 0; i < this.client.bridges.size; i++) {
				let bridge = iterator.next().value[1];
				await message.channel.send(await this.queryMSPT(bridge.rcon));
			}
			return;
		} else {
			await message.channel.send(await this.queryMSPT(rcon));
		}
	}
      
	async queryMSPT(rcon) {
		let data = await rcon.sendCommand("script run reduce(last_tick_times(),_a+_,0)/100;");
		let mspt = parseFloat(data.body.split(" ")[2]);
		let tps;
		let embedColor;

		if (mspt <= 50) {
			tps = 20.0;
		} else {
			tps = 1000/mspt;
		}

		if (mspt.toFixed(1) >= 50) {
			embedColor = "error";
		} else if (mspt.toFixed(1) <= 25) {
			embedColor = "result";
		} else {
			embedColor = "warn";  
		}
		
		let embed = this.client.createEmbed(embedColor)
			.setTitle(`${rcon.name} - TPS: ${tps.toFixed(1)} MSPT: ${mspt.toFixed(1)}`);
		return embed;
	}
}

module.exports = Mspt;
