"use strict";

const Discord = require("discord.js");

const Ping = require("./commands/discord/Ping");
const Rcon = require("./rcon/Rcon");
const Bridge = require("./rcon/Bridge");
const ServerScoreboard = require("./commands/server/Scoreboard");
const DiscordServer = require("./commands/discord/Scoreboard");
const Help = require("./commands/server/Help");
const Backup = require("./commands/discord/Backup");

const config = require("../config.json");

class EndBot extends Discord.Client {
	constructor() {
		super();
		this.config = config;
		this.token = config.token;
		this.prefix = config.prefix;
		this.servers = {};
		this.bridges = new Map();
		this.discordCommands = {
			"ping": new Ping(this),
			"backup": new Backup(this),
			"scoreboard": new DiscordServer(this)
		};
		this.serverCommands = {
			"scoreboard": new ServerScoreboard(this),
			"help": new Help(this)
		};
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

	createEmbed(color) {
		switch (color) {
		case "result":
			color = "#7fe254";
			break;
		case "error":
			color = "#f54f38";
		}

		return new Discord.MessageEmbed()
			.setColor(color);
	}

	/**
	 * Returns a predefined common error embed.<br>
	 * Possible errors are:
	 * - `bridge`: "You must be in a bridge channel to do that!"
	 * - `args`: "Invalid arguments! Do !help for more info."
	 *
	 * @param {String} error
	 * @return {Discord.MessageEmbed}
	 */
	errorEmbed(error) {
		switch (error) {
		case "bridge":
			return this.createEmbed("error")
				.setTitle("You must be in a bridge channel to do that!");
		case "args":
			return this.createEmbed("error")
				.setTitle("Invalid arguments! Do " + this.prefix + "help for more info.");
		}
	}
}

module.exports = EndBot;
