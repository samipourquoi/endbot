"use strict";

const { GoogleSpreadsheet } = require("google-spreadsheet");
const Discord = require("discord.js");
const { generate } = require("@util/embeds.js");

class Form {
	constructor(client) {
		this.client = client;
		this.config = this.client.moduleConfig["Application System"];
		this.url = this.config["form-url"];
		if (!this.url) throw new Error("No form url specified");
		this.doc = new GoogleSpreadsheet(this.url);
		this.totalApplications = 0;
		this.guild = this.client.guilds.cache.get(client.moduleConfig["Application System"]["guild-id"]);
		this.votingChannel = this.client.channels.cache.get(client.moduleConfig["Application System"]["voting-channel"]);
	}
	
	async load() {
		await this.doc.useServiceAccountAuth({
			client_email: this.config["client-email"],
			private_key: this.config["private-key"],
		});
		await this.doc.loadInfo();
		let sheet = this.doc.sheetsByIndex[0];
		
		// Fetches new submissions
		setInterval(async () => {
			let rows = await sheet.getRows();
			this.totalApplications = (await this.client.db.async_get("SELECT value FROM settings WHERE key = \"total_applications\"")).value;
			
			if (this.totalApplications < rows.length) {
				rows.slice(this.totalApplications).forEach(async row => await this.createTicket(row));
			}
		}, 1000*10); // Every 30 seconds
	}
	
	async createTicket(row) {
		let { user, username } = this.findUser(row);
		let ticketChannel = await this.createChannel(user, username);
		await this.generateEmbed(row, ticketChannel, username);
		await this.client.db.async_run("INSERT INTO tickets VALUES (?, ?)", { params: [ticketChannel.id, username] });
	}
	
	findUser(row) {
		let tag = row["What is your Discord Tag?"].split("#");
		let username = tag[0];
		let discriminator = tag[1];
		let user;
		// Converts discord tag into User object
		this.guild.members.cache.forEach(member => {
			if ((member.nickname == username || member.user.username == username) && member.user.discriminator == discriminator) {
				user = member;
				return;
			}
		});
		return { user: user, username: username };
	}
	
	async createChannel(user, username) {
		// Creates the ticket with the right permissions
		let channel = await this.guild.channels.create(`${username}-ticket`, { 
			parent: this.client.moduleConfig["Application System"]["category-id"]
		});
		if (user) await channel.createOverwrite(user, { "VIEW_CHANNEL": true });
		else await channel.send(generate("warn").setTitle(`Couldn't find the user ${username}`));
		await this.client.db.async_run("UPDATE settings SET value = value + 1 WHERE key = \"total_applications\"");
		return channel;
	}
	
	async generateEmbed(row, channel, username) {
		let info = generate("endtech").setTitle(`${username}'s Application`);
		let questions = generate("endtech");
		row._sheet.headerValues.forEach((question, i) => {
			if (!row[question] || i == 0) return;
			if (i < 9) info.addField(question, row[question]);
			else questions.addField(question, row[question]);
		});
		let pinned = await channel.send(info);
		await channel.send(questions);
		await pinned.pin();
		await this.votingChannel.send(info.setDescription(`Click [here](${pinned.url}) to access the full application`));
	}
}

module.exports = Form;
