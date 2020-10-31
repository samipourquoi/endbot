"use strict";

const Form = require("./src/Form");
const ArchiveServer = require("./src/webserver/ArchiveServer");

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
		await client.db.async_run("CREATE TABLE IF NOT EXISTS tickets (id TEXT UNIQUE, applicant TEXT);");
		await client.db.async_run("CREATE TABLE IF NOT EXISTS archived_tickets (id TEXT, name TEXT, round INTEGER, messages JSON NOT NULL );");
		await client.db.async_run("CREATE TABLE IF NOT EXISTS archived_logged_on (token TEXT UNIQUE, expires_in INT)");
		await client.db.async_run("INSERT or IGNORE INTO settings VALUES (?, ?)", { params: [ "total_applications", "0" ] });

		// Form
		let form = new Form(client);
		await form.load();

		// Archive web server
		let archive = new ArchiveServer(client);
		archive.init();
	}
};
