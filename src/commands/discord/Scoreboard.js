"use strict";

const { createCanvas } = require("canvas");

const Command = require("../Command");

class Scoreboard extends Command {
	constructor(client) {
		super(client);
	}

	run(args) {
	}
}

module.exports = Scoreboard;
