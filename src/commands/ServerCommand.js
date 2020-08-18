"use strict";

const Command = require("./Command");

class ServerCommand extends Command {
	constructor(client) {
		super(client);
	}
}

module.exports = ServerCommand;
