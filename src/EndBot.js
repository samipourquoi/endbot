"use strict";

const Discord = require("discord.js");
const Database = require("./misc/Database");
const Ini = require("ini");
const fs = require("fs");
const readdirp = require("readdirp");

const Rcon = require("./rcon/Rcon");
const Bridge = require("./rcon/Bridge");


class EndBot extends Discord.Client {
	constructor(config) {
		super();
		this.flags = {
			noservers: process.argv.includes("--no-servers"),
			debug: process.argv.includes("--debug")
		};
		this.config = config;
		this.token = this.config.token;
		this.prefix = this.config.prefix;
		this.servers = {};
		this.bridges = new Map();
		this.rcons = [];
		this.db = new Database("endbot.db");
		this.moduleConfig = {};
		this.discordCommands = {};
		this.serverCommands = {};
		this.isMock = false;
	}

	async readCommands(modulePath) {
		let commands = {};
		// Reads recursively all command files in the provided module
		let files = await readdirp.promise(modulePath, { 
			fileFilter: "*.js",
			directoryFilter: ["!.git", "!private"]
		});
		
		files.forEach(file => {
			if (file.basename.match(/[A-Z]\w*\.js/) == null) return;
			let command = new (require(file.fullPath))(this);
			if (!command.requirements()) return;
			commands[command.info.usage.split(" ")[0]] = command;
			let alias;
			if ((alias = command.info.alias) != undefined) {
				commands[alias] = command;
			}
		});

		return commands;
	}
	
	async initCommands() {
		this.discordCommands = await this.readCommands("src/commands/discord/");
		this.serverCommands = await this.readCommands("src/commands/server/");
	}
	
	async initModules() {
		let moduleConfigPath = "./modules.config.ini";
		if (!fs.existsSync(moduleConfigPath)) fs.writeFileSync(moduleConfigPath, "");
		let moduleConfig = Ini.parse(fs.readFileSync(moduleConfigPath, "utf-8"));	
		if (!fs.existsSync("modules/")) return;
		
		fs.readdirSync("modules/").forEach(async file => {
			if (!fs.statSync(`modules/${file}`).isDirectory()) return;
			let endbotModule = require(`../modules/${file}`);

			this.moduleConfig[endbotModule.package] = moduleConfig[endbotModule.package] || {};
			for (let field in endbotModule.config) {
				if (!this.moduleConfig[endbotModule.package][field]) {
					this.moduleConfig[endbotModule.package][field] = endbotModule.config[field];
				}
			}

			let requirements = endbotModule.requirements;
			if (requirements) {
				if (!requirements(this)) return;
			}

			let discord = await this.readCommands(`modules/${file}/${endbotModule.discord}/`);
			this.discordCommands = { ...this.discordCommands, ...discord };

			let server = await this.readCommands(`modules/${file}/${endbotModule.server}/`);
			this.serverCommands = { ...this.serverCommands, ...server };

			let setup = endbotModule.setup;
			if (setup) await setup(this);
		});

		fs.writeFileSync(moduleConfigPath, "; Module configuration file\n\n" + Ini.stringify(this.moduleConfig));
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
	
	async initDatabase() {
		await this.db.async_run("CREATE TABLE IF NOT EXISTS presets (username TEXT, name TEXT UNIQUE, objectives TEXT);");
		await this.db.async_run("CREATE TABLE IF NOT EXISTS settings (key TEXT UNIQUE, value TEXT)");
	}

	filterDiscord(message) {
		if (message.author.bot && !this.isMock) return;

		if (this.bridges.has(message.channel.id)) {
			this.bridges.get(message.channel.id).toMinecraft(message);
		}

		if (message.content.charAt(0) !== this.prefix) return;

		let command = message.content.substring(1).split(" ");
		return this.parseDiscordCommand(message, command[0], command.slice(1));
	}

	filterServer(rcon, message) {
		if (message.charAt(message.indexOf(">") + 2) != this.prefix) return;
		
		let author = message.substring(1, message.indexOf(">"));
		let command = message.split(" ");
		command[1] = command[1].substring(1);
		this.parseServerCommand(rcon, author, command[1], command.slice(2));
	}

	parseDiscordCommand(message, command, ...args) {
		let cmd = this.discordCommands[command];
		if (cmd === undefined) return;
		if (this.flags.debug) console.log(message.content, "was ran by", message.author.username);
		return cmd.run(message, ...args);
	}

	parseServerCommand(rcon, authorName, command, ...args) {
		let cmd = this.serverCommands[command];
		if (cmd === undefined) return;

		cmd.run(rcon, authorName, ...args);
	}
}

module.exports = EndBot;
