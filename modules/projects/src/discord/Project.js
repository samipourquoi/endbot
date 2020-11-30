"use strict";

const Command = require("@root/src/commands/Command.js");

class Project extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Projects System",
			"usage": "project",
			"description": "Manage projects for the projects system"
		};
	}

	async run(message, args) {

	}

}

module.exports = Project;
