"use strict";

module.exports = {
	package: "Projects System",
	discord: "src/discord",
	server: "src/server",
	config: {
		"category-id": "783019338814324787",
		"web-port": 8000
	},

	setup: async client => {
		await client.db.async_run(`
			CREATE TABLE IF NOT EXISTS projects (
				name TEXT,
				type TEXT,
				reports TEXT,
				channel_id TEXT,
				leaders TEXT,
				members TEXT,
				coords TEXT,
				schematic TEXT,
				matList TEXT,
				digCoords TEXT
			);
		`);
	},


};
