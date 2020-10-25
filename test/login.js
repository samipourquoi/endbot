"use strict";

const EndBot = require("../src/EndBot");
const Discord = require("discord.js");

class EndBotMock extends EndBot {
	constructor() {
		super({
			prefix: "_",
			token: process.env.ENDBOT_CI_TOKEN
		});
		this.prefix = "_";
		this.isMock = true;
	}
}

const client = new EndBotMock();

async function login() {
	await new Promise(resolve => {
		client.once("ready", resolve);
		client.login(process.env.ENDBOT_CI_TOKEN);
	});
	return client;
}

module.exports = login;
