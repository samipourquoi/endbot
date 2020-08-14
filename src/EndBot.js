"use strict";

const Discord = require("discord.js");
const Ping = require("./commands/Ping");
const Rcon = require("./rcon/Rcon");
const config = require("../config.json");

class EndBot extends Discord.Client {
	constructor() {
		super();
		this.token = config.token;
		this.prefix = config.prefix;
		this.commands = {
			"ping": new Ping()
		};
	}

	init() {
		console.log("Logging in...");

		this.login(this.token)
			.then(console.log("EndBot is on! 😎"));

		this.rcon = new Rcon("localhost", 25575, "supersecret", "Server");
	}

	filterCommand(message) {
		if (message.content.charAt(0) !== this.prefix) 	return;
		if (message.author.bot) 						return;

		let command = message.content.substring(1).split(" ");
		this.parseCommand(message, command[0], command.slice(1));
	}

	parseCommand(message, command, ...args) {
		let cmd = this.commands[command];
		if (cmd == undefined) return;
		cmd.run(message, ...args);
	}
}

module.exports = EndBot;
