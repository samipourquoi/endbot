"use strict";

const Command = require("../Command.js");
const ScalableVC = require("../../misc/ScalableVC");

class ToggleSVC extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Toggle Scalable VC",
			"usage": "togglesvc",
			"description": "(Admin Only) This will toggle if the ScalableVC System can work. The current state will be reacted into the command"
		};
	}

	run(message) {
		if (!message.member.hasPermission("MANAGE_CHANNELS")) {
			message.channel.send("da fuck you tryin' to do");
			return;
		}

		ScalableVC.toggle(message);
	}

	toString() {
		return this.info;
	}
}

module.exports = ToggleSVC;
