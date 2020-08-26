"use strict";

const FancyConsole = require("./src/FancyConsole");
const EndBot = require("./src/EndBot");
const ScalableVC = require("./src/misc/ScalableVC");
const client = module.exports = new EndBot();

console = FancyConsole;

console.log("Logging in...");
client.login(client.token);

if (client.flags.debug) client.on("debug", console.log);

client.once("ready", () => {
	if (!client.flags.noservers) {
		client.initServers();
	}
	ScalableVC.setGuild(client.guilds.cache);
	ScalableVC.reset();
	console.log("EndBot is on! 😎");
});

client.on("message", client.filterDiscord);
client.on("voiceStateUpdate", (oldState, newState) => ScalableVC.voiceEvent(oldState, newState));

