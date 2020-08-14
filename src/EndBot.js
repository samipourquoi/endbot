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
		this.servers = {};
		this.commands = {
			"ping": new Ping()
		};
	}

	init() {
		console.log("Logging in...");

		this.login(this.token)
			.then(() => console.log("EndBot is on! 😎"));

		let keys = Object.keys(config.servers);
		for (let i = 0; i < keys.length; i++) {
			let server = config.servers[keys[i]];
			this.servers[server.name] = new Rcon(server.host, server["rcon-port"], server["rcon-password"], server.name);

			this.servers[server.name].client.on("auth", () => {
				this.servers[server.name].sendMessage("Hello World!", "EndBot");
			});
		}
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
