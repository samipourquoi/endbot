"use strict";

const Form = require("./src/Form");

module.exports = {
	package: "Application System",
	config: {
		"guild-id": "",
		"category-id": "",
		"archive-category-id": "",
		"voting-channel": "",
		"form-url": "",
		"client-email": "",
		"private-key": "",
	},
	
	discord: "src/discord",
	
	requirements: client => {
		let guildID = client.moduleConfig["Application System"]["guild-id"];
		return client.guilds.cache.has(guildID);
	},
	setup: async client => {
		await client.db.async_run("CREATE TABLE IF NOT EXISTS tickets (id TEXT UNIQUE, applicant TEXT);");
		await client.db.async_run("INSERT or IGNORE INTO settings VALUES (?, ?)", { params: [ "total_applications", "0" ] });
		let form = new Form(client);
		await form.load();
	}
};
