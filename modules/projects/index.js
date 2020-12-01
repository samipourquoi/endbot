"use strict";

module.exports = {
	package: "Projects System",
	discord: "src/discord",
	server: "src/server",
	config: {
		"category-id": "783019338814324787"
	},

	setup: async client => {
		await client.db.async_run(`
			CREATE TABLE IF NOT EXISTS projects (
				name TEXT,
				type TEXT,
				reports TEXT,
				channel_id TEXT UNIQUE,
				leaders TEXT,
				members TEXT,
				coords TEXT,
				schematic TEXT,
				mat_list TEXT
			);
		`);
	}
};
