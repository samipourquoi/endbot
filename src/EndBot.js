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
			"ping": new Ping(),
		};
		this.bridges = new Map();
	}

	init() {
		this.guild = this.guilds.cache.get(config["guild-id"]);

		if (this.guilds.cache.size == undefined) {
			console.error("EndBot isn't in the configured server!");
			process.abort();
		}

		// Setup listeners
		let keys = Object.keys(config.servers);
		for (let i = 0; i < keys.length; i++) {
			let server = config.servers[keys[i]];

			// Setup RCON
			let rcon = this.servers[server.name] = new Rcon(server.host, server["rcon-port"], server["rcon-password"], server.name);
			rcon.client.on("auth", () => {
				this.servers[server.name].sendMessage("Hello World!", "EndBot");
			});

			// Setup bridge channels
			let channel = this.guild.channels.cache.get(server["bridge-channel"]);
			this.bridges.set(channel.id, new Bridge(channel, rcon));
		}
	}

	filterCommand(message) {
		if (message.content.charAt(0) !== this.prefix) return;

		if (this.bridges.has(message.channel.id)) {
			console.log(message.content);
			this.bridges.get(message.channel.id).toMinecraft(message);
		}

		if (message.author.bot) return;

		let command = message.content.substring(1).split(" ");
		this.parseCommand(message, command[0], command.slice(1));
	}

	parseCommand(message, command, ...args) {
		let cmd = this.commands[command];
		if (cmd == undefined) return;
		cmd.run(message, ...args);
	}
}

class Bridge {
	constructor(channel, rcon) {
		this.channel = channel;
		this.rcon = rcon;

		this.channel.send(`Connected to ${rcon.name}!`);
	}

	toMinecraft(message) {
		this.rcon.sendMessage(message.content, message.author.username);
	}

	toDiscord(message) {

	}
}

module.exports = EndBot;
