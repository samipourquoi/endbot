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

	async run(message, args) {
		let commands;
		if (args[0] == "--server") commands = this.client.serverCommands;
		else commands = this.client.discordCommands;

		let embed = this.generate(commands);

		await message.channel.send(embed);
	}

	generate(commands) {
		let embed = new Discord.MessageEmbed()
			.setTitle("Help Pannel")
			.setColor("#2F3136");
		let description = "";

		let keys = Object.keys(commands);
		let lastName;
		for (let i = 0; i < keys.length; i++) {
			let command = commands[keys[i]];
			if (command.name != lastName) description += command.toString() + "\n";
			lastName = command.name;
		}
		description += "\n[Full documentation here](https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md)";
		embed.setDescription(description);

		return embed;
	}
}

module.exports = Help;
