"use strict";

const Form = require("./src/Form");

module.exports = {
	package: "Application System",
	config: {
		"guild-id": "",
		"category-id": "",
		"form-url": "",
		"client-email": "",
		"private-key": ""
	},
	
	discord: "src/discord",
	
	requirements: client => {
		let guildID = client.moduleConfig["Application System"]["guild-id"];
		return client.guilds.cache.has(guildID);
	},
	setup: async client => {
		console.log("hello");
		await client.db.async_run("INSERT or IGNORE INTO settings VALUES (?, ?)", { params: [ "total_applications", "0" ] });
		console.log("world");
		let form = new Form(client);
		await form.load();
	}
};
