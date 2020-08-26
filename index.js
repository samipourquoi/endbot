"use strict";


// Requires setting up console first for proper logging
const { Console } = require("console");

console = new (class extends Console {
	constructor() {
		super({ stdout: process.stdout, stderr: process.stderr });
	}

	log(...data) {
		let time = this.getTime();
		super.log("[endbot]", `\x1b[37m${time}\x1b[0m`, "[INFO]", ...data);
	}

	error(...data) {
		let time = this.getTime();
		super.log("[endbot]", `\x1b[37m${time}\x1b[31m`, "[ERROR]", ...data, "\x1b[0m");
	}

	warn(...data) {
		let time = this.getTime();
		super.log("[endbot]", `\x1b[37m${time}\x1b[33m`, "[WARNING]", ...data, "\x1b[0m");
	}

	getTime() {
		let date = new Date();
		let hours = String(date.getHours()).padStart(2, "0");
		let minutes = String(date.getMinutes()).padStart(2, "0");
		let seconds = String(date.getSeconds()).padStart(2, "0");
		return `[${hours}:${minutes}:${seconds}]`;
	}
});

const ScalableVC = require("./src/misc/ScalableVC");
const EndBot = require("./src/EndBot");
const client = module.exports = new EndBot();

console.log("Logging in...");
client.login(client.token);

client.once("ready", () => {
	//client.init();
	console.log("EndBot is on! 😎");
});

client.on("message", client.filterDiscord);
client.on("voiceStateUpdate", (oldState, newState) => ScalableVC.voiceEvent(oldState, newState));
