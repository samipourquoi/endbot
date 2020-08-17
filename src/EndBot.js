"use strict";

const Discord = require("discord.js");
const Miteru = require("miteru");
const fs = require("fs");
const Ping = require("./commands/Ping");
const Rcon = require("./rcon/Rcon");
const config = require("../config.json");
const deathMessages = require("./assets/deaths.json");
const colors = {
	"dark_red": "#AA0000",
	"red": "#FF5555",
	"gold": "#FFAA00",
	"yellow": "#FFFF55",
	"dark_green": "#00AA00",
	"green": "#55FF55",
	"aqua": "#55FFFF",
	"dark_aqua": "#00AAAA",
	"dark_blue": "#0000AA",
	"blue": "#5555FF",
	"light_purple": "#FF55FF",
	"dark_purple": "#AA00AA",
	"white": "#FFFFFF",
	"gray": "#AAAAAA",
	"dark_gray": "#555555",
	"black": "#000000"
};
const nearestColor = require("nearest-color").from(colors);

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
			this.bridges.set(channel.id, new Bridge(channel, rcon, server["log-path"]));
		}
	}

	filterCommand(message) {
		if (message.author.bot) return;

		if (this.bridges.has(message.channel.id)) {
			console.log(message.content);
			this.bridges.get(message.channel.id).toMinecraft(message);
		}

		if (message.content.charAt(0) !== this.prefix) return;

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
	constructor(channel, rcon, logPath) {
		this.channel = channel;
		this.rcon = rcon;
		this.lastIndex = 1;

		// Log reader
		this.logPath = logPath;
		this.logWatcher = Miteru.watch((event, path) => {
			switch (event) {
			case "init":
				console.log(`Watching ${rcon.name} logs`);
				this.lastIndex = fs.readFileSync(this.logPath, {encoding: "utf-8"}).split("\n").length;
				break;

			case "change":
				this.onMessage();
				break;

			case "unlink":
				console.log(`${rcon.name} log file is getting reseted...`);
				this.lastIndex = 1;
				break;

			case "add":
				console.log(`${rcon.name} log file has successfully been reseted`);
				break;
			}
		});
		this.logWatcher.add(this.logPath);

		this.channel.send(`Connected to ${rcon.name}!`);
	}

	toMinecraft(message) {
		// Gets the color of the user
		let aboveRole = message.member.roles.cache.array()[0];
		let color = "white";
		if (message.member.roles.cache.array()[0].name != "@everyone") {
			let roleColor = aboveRole.color;
			color = this.roleToColor(roleColor).name;
		}

		this.rcon.sendMessage(message.content, message.author.username, color);
	}

	roleToColor(roleColor) {
		let rgbRole = hexToRgb(roleColor.toString(16).padStart(6, "0"));
		if (rgbRole == undefined) return "white";
		return nearestColor(rgbRole);
	}

	onMessage() {
		let logs = fs.readFileSync(this.logPath, {encoding: "utf-8"}).split("\n");

		// In case multiple messages get sent in the same tick
		for (let i = 0; i < logs.length - this.lastIndex; i++) {
			let line = logs[this.lastIndex + i - 1];
			line = line.substring(33);

			let message = "";

			// <samipourquoi> Lorem ipsum
			if ((message = line.match(/<.+> .+/)) != null) {
				console.log(message[0]);
				this.channel.send(message[0]);

			// [samipourquoi: Set own game mode to Survival Mode]
			} else if (((message = line.match(/\[.+: .+/)) != null)) {
				this.channel.send(`*${message[0]}*`);

			// samipourquoi fell out the world
			} else if (this.isDeathMessage(line)) {
				this.channel.send(line);
			}
		}
		this.lastIndex = logs.length;
	}

	isDeathMessage(message) {
		let keys = Object.keys(deathMessages);
		for (let i = 0; i < keys.length; i++) {
			if (message.includes(deathMessages[keys[i]])) return true;
		}

		return false;
	}
}

function hexToRgb(hex) {
	var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

module.exports = EndBot;
