"use strict";

const Command = require("@root/src/commands/Command");

class Links extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Discord Links",
			"usage": "links add",
			"description": "Adds discord invitations to an embed"
		};
	}
		
	run(message, args) {
	}
}

module.exports = Links;
