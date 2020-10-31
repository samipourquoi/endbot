"use strict";

const express = require("express");

class ArchiveServer {
	constructor(client) {
		this.client = client;
		this.server = express();
		this.config = this.client.moduleConfig["Application System"];
	}

	init() {
		this.server.set("view engine", "ejs");
		this.server.set("views","modules/applications/views");
		this.server.get("/apps/:identifier/", (req, res) => this.getArchive(req, res));
		this.server.use("/", express.static("modules/applications/public/"));
		this.server.listen(this.config["archive-server-port"]);
	}

	async getArchive(req, res) {
		// TODO: Make archive request work with either name or ID
		let identifier = req.params.identifier;

		try {
			// Selects the timestamp of the first message, in each of
			// the applicant's tickets.
			let timestamps = await this.client.db.async_all(
				"SELECT json_extract(messages, \"$[0].timestamp\") AS timestamp FROM archived_tickets WHERE name = ?;",
				{ params: [ identifier ] }
			);

			// If the person has applied more than once and there are no
			// queries for which round to get, it will send a page with the
			// list of links to all of their tickets.
			// If there is a 'round' specified it will get that one.
			// Otherwise, it will redirect to their first (and only) ticket.
			if (timestamps.length > 1 && !req.query.round) {
				res.render("rounds", { name: identifier, tickets: timestamps });
			} else if (req.query.round) {
				let messages;
				let round = req.query.round ? parseInt(req.query.round) : 0;
				messages = await this.createMessagesList(identifier, round);

				res.render("channel", { messages: messages });
			} else {
				res.redirect("?round=0");
			}
		} catch {
			res.status(404).send("404: Unable to find application.");
		}
	}

	async createMessagesList(identifier, round) {
		let messages = await this.client.db.async_get("SELECT messages FROM archived_tickets WHERE name = ? AND round = ?", {
			params: [ identifier, round ]
		});
		messages = JSON.parse(messages.messages);
		return messages;
	}
}

module.exports = ArchiveServer;
