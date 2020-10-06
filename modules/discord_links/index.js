"use strict";

function setup(client) {
	// Creates table in database
	client.db.async_run("CREATE TABLE IF NOT EXISTS discord_links (name TEXT, invite TEXT, emote_id TEXT);");
}

module.exports = {
	package: "Discord Links",
	discord: "src/discord",
	setup: setup
};
