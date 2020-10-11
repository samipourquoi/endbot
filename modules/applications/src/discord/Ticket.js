"use strict";

const Command = require("@root/src/commands/Command.js");

class Ticket extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Ticket System",
			"usage": "ticket",
			"description": "Manage tickets for the application system"
		};
	}

	async run(message, args) {		
		try {
			if (!message.member.hasPermission("MANAGE_CHANNELS")) throw "da fuck you tryin' to do";
			
			switch (args[0]) {
			case "close": await this.close(message, args.slice(1)); break;
			}
		} catch (e) {
			let errorEmbed = this.client.createEmbed("error").setTitle(e);
			message.channel.send(errorEmbed);
		}
	}
	
	async close(message, args) {
		let isTicket = (await this.client.db.async_get("SELECT 1 FROM tickets WHERE id = ?", { params: message.channel.id })) != undefined;
		if (isTicket) {
			await this.client.db.async_run("DELETE FROM tickets WHERE id = ?", { params: message.channel.id });
			await message.channel.setParent(this.client.moduleConfig["Application System"]["archive-category-id"]);
			await message.channel.overwritePermissions([]);
		} else {
			throw "This channel is not a ticket";
		}
	}
}

module.exports = Ticket;
