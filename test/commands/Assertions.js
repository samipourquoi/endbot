"use strict";

const Discord = require("discord.js");

class Assertions {
	constructor(client, channel) {
		this.client = client;
		this.channel = channel;
	}

	runCommand(string, message) {
		return this.client.filterDiscord(message? message: new Discord.Message(this.client, {
			content: string,
			author: this.client
		}, this.channel));
	}

	lastMessage() {
		return this.channel.lastMessage;
	}

	lastEmbed() {
		return this.lastMessage().embeds[0];
	}
}

module.exports = Assertions;
