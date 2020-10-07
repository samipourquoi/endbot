"use strict";

function setup(client) {
	// Creates table in database
	client.db.async_run(`CREATE TABLE IF NOT EXISTS discord_links (
		name TEXT,
		registry TEXT,
		invite TEXT, 
		emote_id TEXT,
		PRIMARY KEY (name, registry)
	);`);
}

module.exports = {
	package: "Embed Editor Command",
	
	discord: "src/discord",
	server: undefined,
	
	setup: setup,
};
