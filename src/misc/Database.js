"use strict";

const SQLite = require("sqlite3");

/**
 * Adds promise-based sql queries.
 *
 * @author samipourquoi
 */
class Database extends SQLite.Database {
	constructor(db) {
		super(db);
	}

	/**
	 * Promise-based version of SQLite3.Database.get()
	 */
	async_get(statement, { params = [], rcon } = {}) {
		return new Promise((resolve, reject) => {
			super.get(statement, params, (err, result) => {
				if (err) {
					if (rcon) rcon.error(err);
					reject(err);
					return;
				}
				
				resolve(result);
			});
		});
	}
	
	/**
	 * Promise-based version of SQLite3.Database.run()
	 */
	async_run(statement, { params = [], rcon } = {}) {
		return new Promise((resolve, reject) => {
			super.run(statement, params, err => {
				if (err) {
					if (rcon) rcon.error(err);
					reject(err);
					return;
				}
				
				resolve();
			});
		});
	}

	/**
	 * Promise-based version of SQLite3.Database.all()
	 */
	async_all(statement, { params = [], rcon } = {}) {
		return new Promise((resolve, reject) => {
			super.all(statement, params, (err, result) => {
				if (err) {
					if (rcon) rcon.error(err);
					reject(err);
				}
				
				resolve(result);
			});
		});
	}
}

module.exports = Database;
