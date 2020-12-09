"use strict";

const express = require("express");

class Webpage {
	constructor(client) {
		this.client = client;
		this.app = express();
		this.config = this.client.moduleConfig["Projects System"];
	}

	init() {
		this.app.set("view engine", "ejs");
		this.app.set("views", "modules/projects/views");
		this.app.locals.rmWhitespace = true;


		this.app.get("/projects/", ((req, res) => this.getHomepage(req, res)));
		this.app.use("/", express.static("modules/projects/public"));
		this.app.listen(this.config["web-port"], () => {
			console.log("Projects web server running!");
		});
	}

	async getHomepage(req, res) {
		res.render("home", {
			projects: await this.client.db.async_run("SELECT * FROM projects")
		});
	}
}

module.exports = Webpage;
