"use strict";

const Discord = require("discord.js");

const Ping = require("./commands/discord/Ping");
const Rcon = require("./rcon/Rcon");
const Bridge = require("./rcon/Bridge");
const Scoreboard = require("./commands/server/Scoreboard");
const Help = require("./commands/server/Help");

const config = require("../config.json");

class EndBot extends Discord.Client {
	constructor() {
		super();
		this.token = config.token;
		this.prefix = config.prefix;
		this.servers = {};
		this.discordCommands = {
			"ping": new Ping(this),
		};
		this.serverCommands = {
			"scoreboard": new Scoreboard(this)
		};
		this.bridges = new Map();
		this.rcons = [];
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
			let rcon = this.servers[server.name] = new Rcon({
				host: server.host,
				port: server["rcon-port"],
				password: server["rcon-password"],
				name: server.name
			}, this);
			rcon.connection.on("auth", () => {
				this.servers[server.name].sendMessage("Hello World!", { author: "EndBot", color: "dark_purple"});
			});

			// Setup bridge channels
			let channel = this.guild.channels.cache.get(server["bridge-channel"]);
			this.bridges.set(channel.id, new Bridge(channel, rcon, server["log-path"], this));
			this.rcons.push(rcon);
		}
	}

	filterDiscord(message) {
		if (message.author.bot) return;

		if (this.bridges.has(message.channel.id)) {
			this.bridges.get(message.channel.id).toMinecraft(message);
		}

		if (message.content.charAt(0) !== this.prefix) return;

		let command = message.content.substring(1).split(" ");
		this.parseDiscordCommand(message, command[0], command.slice(1));
	}

	filterServer(rcon, message) {
		if (message.charAt(0) == this.prefix) return;

		let author = message.substring(1, message.indexOf(">"));
		let command = message.split(" ");
		command[1] = command[1].substring(1);

		this.parseServerCommand(rcon, author, command[1], command.slice(2));
	}

	parseDiscordCommand(message, command, ...args) {
		let cmd = this.discordCommands[command];
		if (cmd == undefined) return;

		cmd.run(message, ...args);
	}

	parseServerCommand(rcon, authorName, command, ...args) {
		let cmd = this.serverCommands[command];
		if (cmd == undefined) return;

		cmd.run(rcon, authorName, ...args);
	}
}

module.exports = EndBot;
