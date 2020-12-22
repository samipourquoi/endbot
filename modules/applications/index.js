"use strict";

const Form = require("./src/Form");
const Archive = require("./src/Archive");

module.exports = {
	package: "Application System",
	config: {
		"guild-id": "",
		"category-id": "",
		"voting-channel": "",
		"form-url": "",
		"client-email": "",
		"private-key": "",
		"yes": "✅",
		"no": "❌",
		"archive-server-port": "3000",
		"voting-role": "",
		"oauth2-url": "",
		"redirect-uri": ""
	},
	
	discord: "src/discord",
	
	requirements: client => {
		let guildID = client.moduleConfig["Application System"]["guild-id"];
		return client.guilds.cache.has(guildID);
	},
	setup: async client => {
		// Database
		// await client.db.async_run("CREATE TABLE IF NOT EXISTS tickets (id TEXT UNIQUE, applicant TEXT, link TEXT, pfp TEXT, discriminator INT, date TEXT);");
		// await client.db.async_run("CREATE TABLE IF NOT EXISTS archived_tickets (id TEXT, name TEXT, round INTEGER, messages JSON NOT NULL, status TEXT, pfp TEXT DEFAULT '/assets/default-avatar.png', discriminator INT, date TEXT);");
		await client.db.async_run("CREATE TABLE IF NOT EXISTS archived_logged_on (token TEXT, expires_in BIGINT, pfp TEXT);");
		await client.db.async_run("INSERT IGNORE INTO settings VALUES ('total_applications', 0);");

		await client.db.async_run(`
			CREATE TABLE IF NOT EXISTS apps (
				channel_id TEXT,
				user_id TEXT,
				username TEXT,
				discriminator TEXT,
				avatar TEXT,
				link TEXT,
				date BIGINT, -- Unix time
				status TEXT,
				round INT,
				messages MEDIUMTEXT,
				answers MEDIUMTEXT
			);
		`);

		// Archive web server
		let archive = new Archive(client);
		archive.init();

		// Form
		let form = new Form(client);
		await form.load();
	}
};
