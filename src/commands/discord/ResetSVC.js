"use strict";

const Command = require("../Command.js");
const ScalableVC = require("../../misc/ScalableVC");

class ResetSVC extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Reset Scalable VC",
			"usage": "resetsvc",
			"description": "(Admin Only) This will revert the ScalableVC system back to it's original state, and clean up the channels. Run when bugs are encountered"
		};
	}

	run(message) {
		if (!message.member.roles.cache.has(this.client.config["admin-role"])) {
			message.channel.send("da fuck you tryin' to do");
			return;
		}

		ScalableVC.reset(message);
	}

	toString() {
		return this.info;
	}
}

module.exports = ResetSVC;
