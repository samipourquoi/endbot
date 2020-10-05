"use strict";

const Command = require("./Command");

class ServerCommand extends Command {
	constructor(client) {
		super(client);
	}
	
	requirements() {
		return !this.client.flags.noservers;
	}
}

module.exports = ServerCommand;
