"use strict";

const mysql = require("mysql");

/*
Promised based mysql queries.
 *
 * @author iDarkLightning
 */

class Database {
	constructor(config) {
		this.connection = mysql.createConnection(config);
	}

	async_run(statement, { params } = {}) {
		return new Promise((resolve, reject) => {
			this.connection.query(statement, params, err => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	}

	async_get(statement, { params } = {}) {
		return new Promise((resolve, reject) => {
			this.connection.query(statement, params, (err, rows) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(JSON.parse(JSON.stringify(rows))[0]);
			});
		});
	}

	//Deprecated
	async_all(statement, { params } = {}) {
		return new Promise((resolve, reject) => {
			this.connection.query(statement, params, (err, rows) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(JSON.parse(JSON.stringify(rows)));
			});
		});
	}
}

module.exports = Database;
