"use strict";

require("module-alias/register");
console = require("./src/misc/FancyConsole");

let config;
try {
	config = require("./config.json");
} catch (e) {
	console.error("Unable to load config. Have you copied `config.template.json` to `config.json`?");
	process.exit(1);
}

const EndBot = require("./src/EndBot");
const client = module.exports = new EndBot(config);

console.log("Logging in...");
client.login(client.token);

if (client.flags.debug) client.on("debug", console.log);

client.once("ready", async () => {
	if (!client.flags.noservers) {
		client.initServers();
	}
	await client.initDatabase();
	await client.initCommands();
	await client.initModules();
	console.log("EndBot is on! 😎");
});

client.on("message", async message => {
	try {
		await client.filterDiscord(message);
	} catch (e) {
		console.error("uh-oh!... " + e);
	}
});
