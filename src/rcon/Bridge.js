"use strict";

const Miteru = require("miteru");
const fs = require("fs");

const SPECIAL_MESSAGES = require("../assets/special_messages.json");
const COLORS = {
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
const nearestColor = require("nearest-color").from(COLORS);

class Bridge {
	constructor(channel, rcon, logPath, client) {
		this.channel = channel;
		this.rcon = rcon;
		this.lastIndex = 1;
		this.client = client;
		this.colorsOverride = this.client.config["colors-override"] || {};

		// Makes the hex color uniform
		let keys = Object.keys(this.colorsOverride);
		for (let i = 0; i < keys.length; i++) {
			this.colorsOverride[
				keys[i].charAt(0) == "#" ? keys[i].substring(1).toUpperCase() : keys[i].toUpperCase()
			] = this.colorsOverride[keys[i]];
		}

		// Log reader
		this.logPath = logPath;
		this.logWatcher = Miteru.watch(event => {
			switch (event) {
			case "init":
				console.log(`Watching ${rcon.name} logs`);
				this.lastIndex = fs.readFileSync(this.logPath, { encoding: "utf-8" }).split("\n").length;
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
	}

	toMinecraft(message) {
		// Gets the color of the user
		let aboveRole = message.member.roles.highest;
		let color = "white";
		if (message.member.roles.cache.array()[0].name != "@everyone") {
			let roleColor = parseInt(aboveRole.color);
			let hexColor = roleColor.toString(16).padStart(6, "0").toUpperCase();
			color = this.colorsOverride[hexColor] || closestMinecraftColor(roleColor);
		}

		let finalMessage = this.identifierToName(message.content);
		this.rcon.sendMessage(finalMessage, { author: message.author.username, color: color });
	}


	onMessage() {
		let logs = fs.readFileSync(this.logPath, {encoding: "utf-8"}).split("\n");

		// In case multiple messages get sent in the same tick
		let messages = [];
		for (let i = 0; i < logs.length - this.lastIndex; i++) {
			let line = logs[this.lastIndex + i - 1];
			line = line.substring(33);

			// Escapes markdown characters in username
			let escaped = line.replace(/([_*~`])/g, "\\$1");
			line = escaped.substring(0, escaped.indexOf(">")) + line.substring(line.indexOf(">"));

			let message = "";

			// <samipourquoi> Lorem ipsum
			if ((message = line.match(/<.+> .+/)) != null) {
				messages.push(message[0]);
				this.client.filterServer(this.rcon, message[0]);

				// lost connection: Disconnected
			} else if (line.includes("[type]:") || line.includes("[Rcon]:" || line.includes("[Rcon:"))) {
				// do nothing

			// [samipourquoi: Set own game mode to Survival Mode]
			} else if (((message = line.match(/\[.{1,20}: .+/)) != null)) {
				messages.push(`*${message[0]}*`);

			// samipourquoi fell out the world
			} else if (isSpecialMessage(line)) {
				messages.push(line);
			}

		}

		let finalMessage = this.nameToIdentifier(messages.join("\n"));
		if (messages.length > 0) this.channel.send(finalMessage, { split: true, disableMentions: "all" });
		this.lastIndex = logs.length;
	}

	nameToIdentifier(message) {
		let potentialEmotes = message.match(/(:.+?:)/gm);
		if (potentialEmotes == null) return message;

		const guildEmotes = new Map();
		this.channel.guild.emojis.cache.array().forEach(emote => {
			guildEmotes.set(`:${emote.name}:`, `<:${emote.name}:${emote.id}>`);
		});

		for (let i = 0; i < potentialEmotes.length; i++) {
			message = message.replace(new RegExp(`(${potentialEmotes})`, "gm"), guildEmotes.get(potentialEmotes[i]) || "$1");
			console.log(message);
		}

		return message;
	}

	identifierToName(message) {
		return message.replace(/<(:[a-zA-Z]+:)[0-9]+>/gm, "$1");
	}
}

function closestMinecraftColor(color) {
	// Converts decimal color number to hex color string
	let rgbRole = hexToRgb(color.toString(16).padStart(6, "0"));

	if (rgbRole == undefined) return "white";
	return nearestColor(rgbRole).name;
}

function hexToRgb(hex) {
	let result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function isSpecialMessage(message) {
	let keys = Object.keys(SPECIAL_MESSAGES);
	for (let i = 0; i < keys.length; i++) {
		if (message.includes(SPECIAL_MESSAGES[keys[i]])) return true;
	}

	return false;
}

module.exports = Bridge;
