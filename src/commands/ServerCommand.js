"use strict";

const Command = require("./Command");

class ServerCommand extends Command {
	constructor(client, rcon) {
		super(client);
		this.rcon = rcon;
	}
}

module.exports = ServerCommand;
