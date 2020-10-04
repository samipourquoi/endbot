"use strict";

const SQLite = require("sqlite3");

class Database extends SQLite.Database {
	constructor(db) {
		super(db);
	}
}

module.exports = Database;
