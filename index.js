"use strict";

const EndBot = require("./src/EndBot");
const client = new EndBot();
const { Console } = require("console");

console = new (class extends Console {
	constructor() {
		super({ stdout: process.stdout, stderr: process.stderr });
	}

	log(...data) {
		let date = new Date();
		let hours = String(date.getHours()).padStart(2, "0");
		let minutes = String(date.getMinutes()).padStart(2, "0");
		let seconds = String(date.getSeconds()).padStart(2, "0");

		super.log(`\x1b[37m[${hours}:${minutes}:${seconds}]\x1b[0m`, ...data);
	}
});

client.init();
client.on("message", client.filterCommand);

module.export = client;
