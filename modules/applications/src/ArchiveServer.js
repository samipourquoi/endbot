"use strict";

const fs = require("fs");
const express = require("express");
// const templates = {
// 	channel: fs.readFileSync("modules/applications/src/assets/channel.ejs")
// };

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
		// Sets the `round` query to a number, defaulted to 0
		req.query.round = parseInt(req.query.round);
		if (isNaN(req.query.round)) req.query.round = 0;

		let identifier = req.params.identifier;
		let round = req.query.round;

		let messages;
		try {
			messages = await this.createMessagesList(identifier, round);
		} catch {
			res.status(404).send("404: Unable to find application.");
			return;
		}

		// let page = templates.channel.toString();
		// page = page.replace("<!-- insert messages here -->", messages.join("\n"));
		// res.send(page);
		res.render("channel", { messages: messages });
	}

	async createMessagesList(identifier, round) {
		let list = [];
		let messages = await this.client.db.async_get("SELECT messages FROM archived_tickets WHERE name = ? AND round = ?", {
			params: [ identifier, round ]
		});
		messages = JSON.parse(messages.messages);
		return messages;
	}
}

module.exports = ArchiveServer;
