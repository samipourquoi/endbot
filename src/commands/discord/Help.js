"use strict";

const Discord = require("discord.js");

const Command = require("../Command.js");

class Help extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Help",
			"usage": "help [--server | --discord]",
			"description": "Displays that pannel"
		};
	}

	run(message, args) {
		let commands;
		if (args[0] == "--server") {
			commands = this.client.serverCommands;
		} else {
			commands = this.client.discordCommands;
		}

		let embed = new Discord.MessageEmbed()
			.setTitle("Help Pannel")
			.setColor("#2F3136");
		let description = "";

		let addedCommands = [];
		let keys = Object.keys(commands);
		for (let i = 0; i < keys.length; i++) {
			let command = commands[keys[i]];
			if (addedCommands.includes(command.description)) continue;
			description += command.toString() + "\n";
			addedCommands.push(command.description);
		}

		description += "\n[Full documentation here](https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md)";

		embed.setDescription(description);
		// https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md

		message.channel.send(embed);
	}
}

module.exports = Help;
