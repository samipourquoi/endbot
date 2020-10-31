"use strict";

const Command = require("@root/src/commands/Command.js");
const Discord = require("discord.js");
const { generate } = require("@util/embeds.js");

class Ticket extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Ticket System",
			"usage": "ticket",
			"description": "Manage tickets for the application system"
		};
		this.config = this.client.moduleConfig["Application System"];
		this.votingChannel = this.client.channels.cache.get(this.config["voting-channel"]);
	}

	async run(message, args) {		
		try {
			if (!message.member.hasPermission("MANAGE_CHANNELS")) throw "da fuck you tryin' to do";
			
			switch (args[0]) {
			case "close": await this.close(message, args.slice(1)); break;
			case "vote": await this.vote(message, args.slice(1)); break;
			}
		} catch (e) {
			let errorEmbed = generate("error").setTitle(e);
			await message.channel.send(errorEmbed);
		}
	}

	async vote(message, args) {
		let application = await this.client.db.async_get("SELECT * FROM tickets WHERE id = ?", { params: message.channel.id });
		if (!application) throw "This channel is not a ticket";
		let embed = generate("endtech")
			.setAuthor(application.applicant, application.pfp)
			.setDescription(`[Full application here](${application.link})`);

		let votable = await this.votingChannel.send(embed);
		await votable.react(this.config["yes"]);
		await votable.react(this.config["no"]);
	}
	
	async close(message, args) {
		let isTicket = (await this.client.db.async_get("SELECT 1 FROM tickets WHERE id = ?", { params: message.channel.id })) != undefined;
		if (isTicket) {
			await this.client.db.async_run("DELETE FROM tickets WHERE id = ?", { params: message.channel.id });
			await message.channel.setParent(this.config["archive-category-id"]);
			await message.channel.lockPermissions();
		} else {
			throw "This channel is not a ticket";
		}
	}
}

module.exports = Ticket;
