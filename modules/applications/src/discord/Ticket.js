"use strict";

const Command = require("@root/src/commands/Command.js");
const { generate, getFormattedDate } = require("@util/embeds.js");

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
			switch (args[0]) {
			case "declined":
			case "decline":
			case "deny":
			case "no":
				await this.close(message, args.slice(1), "declined");
				break;
			case "accepted":
			case "accept":
			case "yes":
				await this.close(message, args.slice(1), "accepted");
				break;
			case "close": // for legacy reasons
				await message.channel.send("it's `ticket <accept|deny>` you babunga");
				break;
			case "vote":
				await this.vote(message, args.slice(1));
				break;
			}
		} catch (e) {
			let errorEmbed = generate("error").setTitle(e);
			await message.channel.send(errorEmbed);
		}
	}

	async vote(message, args) {
		let application = await this.client.db.async_get("SELECT * FROM apps WHERE channel_id = ?", { params: message.channel.id });
		if (!application) throw "This channel is not a ticket";
		let embed = generate("endtech")
			.setAuthor(application.username, application.avatar)
			.setDescription(`[Full application here](${application.link})`);

		let votable = await this.votingChannel.send(embed);
		await votable.react(this.config["yes"]);
		await votable.react(this.config["no"]);
	}
	
	async close(message, args, status) {
		let isTicket = (await this.client.db.async_get(
			"SELECT * FROM apps WHERE channel_id = ?;",
			{ params: [ message.channel.id ] })
		) != undefined;

		console.log(isTicket);

		if (isTicket) {
			let messages = JSON.stringify(await this.getMessageHistory(message.channel));
			let applicantName = message.channel.name.replace(/(.+)-ticket/, "$1");
			await this.client.db.async_run(
				"UPDATE apps SET messages = ?, status = ? WHERE username = ? OR channel_id = ?",
				{ params: [ messages, status, applicantName, message.channel.id ] }
			);
			await message.channel.delete();
		} else {
			throw "This channel is not a ticket";
		}
	}

	async getMessageHistory(channel) {
		const BATCH_SIZE = 50;
		let history = [];
		let batch;
		let beforeMessage = channel.lastMessageID;

		// Fetches batches of messages in a channel, until
		// it reaches the first message posted in it.
		do {
			batch = await channel.messages.fetch({
				limit: BATCH_SIZE,
				before: beforeMessage
			}, false);

			if (batch.size == 0) break;
			beforeMessage = batch.last().id;

			// TODO: More space efficient storage
			batch.array().forEach(message => {
				history.push({
					user: message.author.username,
					pfp: message.author.avatarURL({ format: "png" }),
					timestamp: getFormattedDate(message.createdAt),
					content: message.content,
					embed: message.embeds.length > 0 ? message.embeds[0].toJSON() : null,
					image: message.attachments.map(value => value.url)
				});
			});
		} while (batch.size == BATCH_SIZE);

		return history.reverse();
	}
}

module.exports = Ticket;
