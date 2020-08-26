"use strict";

const Discord = require("discord.js");
const fs = require("fs");

const Rcon = require("./rcon/Rcon");
const Bridge = require("./rcon/Bridge");

let config;

try {
	config = require("../config.json");
} catch (e) {
	console.error("Unable to load config");
	process.exit(1);
}

class EndBot extends Discord.Client {
	constructor() {
		super();
		this.flags = {
			noservers: process.argv.includes("--no-servers"),
			debug: process.argv.includes("--debug")
		};
		this.config = config;
		this.token = config.token;
		this.prefix = config.prefix;
		this.servers = {};
		this.bridges = new Map();
		this.discordCommands = this.readCommands("src/commands/discord/");
		this.serverCommands = this.readCommands("src/commands/server/");
		this.rcons = [];
	}


	readCommands(module) {
		let commands = {};
		fs.readdirSync(module).forEach(file => {
			let commandPath = "./" + module.split("/").slice(1).join("/") + file;
			let command = new (require(commandPath))(this);
			commands[command.info.usage.split(" ")[0]] = command;
		});

		return commands;
	}

	initServers() {
		// Setup listeners
		let keys = Object.keys(config.servers);
		for (let i = 0; i < keys.length; i++) {
			let server = config.servers[keys[i]];
			let channel = this.channels.cache.get(server["bridge-channel"]);

			// Setup RCON
			let rcon = this.servers[server.name] = new Rcon({
				host: server.host,
				port: server["rcon-port"],
				password: server["rcon-password"],
				name: server.name
			}, this);
			rcon.connection.on("auth", () => {
				this.servers[server.name].sendMessage("Hello World!", { author: "EndBot", color: "dark_purple"});
				channel.send(`Connected to ${rcon.name}!`);
			});

			// Setup bridge channels
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
		if (message.charAt(0) === this.prefix) return;

		let author = message.substring(1, message.indexOf(">"));
		let command = message.split(" ");
		command[1] = command[1].substring(1);

		this.parseServerCommand(rcon, author, command[1], command.slice(2));
	}

	parseDiscordCommand(message, command, ...args) {
		let cmd = this.discordCommands[command];
		if (cmd === undefined) return;
		if (this.flags.debug) console.log(message.content, "was ran by", message.author.username);
		cmd.run(message, ...args);
	}

	parseServerCommand(rcon, authorName, command, ...args) {
		let cmd = this.serverCommands[command];
		if (cmd === undefined) return;

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
	 * - `unexpected`: "An unexpected error has occured while performing that command"
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
		case "unexpected":
			return this.createEmbed("error")
				.setTitle("An unexpected error has occured while performing that command");
		}
	}
}

module.exports = EndBot;
