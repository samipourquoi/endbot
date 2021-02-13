"use strict";

function setup(client) {
	// Creates table in database
	//TODO: Key length for PRIMARY KEY
	client.db.async_run(`CREATE TABLE IF NOT EXISTS discord_links (
		name TEXT,
		registry TEXT,
		invite TEXT, 
		emote_id TEXT,
		PRIMARY KEY (name(255), registry(255))
	);`);
}

module.exports = {
	package: "Embed Editor",
	config: {
		"emote-server-id": ""
	},
	
	discord: "src/discord",
	server: undefined,
	
	setup: setup,
};
