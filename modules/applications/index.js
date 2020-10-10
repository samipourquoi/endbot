"use strict";

module.exports = {
	package: "Application System",
	discord: "src/discord",
	requirements: client => {
		// only for endtech and my test discord!
		return client.guilds.cache.has("476480403612631041") || client.guilds.cache.has("694311004258959390");
	}
};
