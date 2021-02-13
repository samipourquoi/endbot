"use strict";

const Command = require("../Command");

class Reconnect extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Reconnect",
			"usage": "reconnect",
			"description": "Reconnects to servers in case something bad happens"
		}
		this.publicUsable = true;
	}

	async run(message, args) {
		if (this.isUsable(message.member)) {
			this.client.rcons.forEach(rcon => {
				rcon.connect();
			});
		} else {
			await message.channel.send("da fuck you tryin' to do")
		}
	}

	isUsable(user) {
		if (user.roles.cache.has(this.client.config["op-role"])) {
			return true;
		} else if (this.publicUsable) {
			// Makes it usable after 10 minutes
			this.publicUsable = false;
			setTimeout(() => this.publicUsable = true, 1000*60*2);
			return true;
		} else {
			return false;
		}
	}
}

module.exports = Reconnect;
