"use strict";

const Command = require("@root/src/commands/Command");
const Discord = require("discord.js");
const EMOTE_SERVER_ID = "694311004258959390";
const Canvas = require("canvas");

class Links extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Discord Links",
			"usage": "links add",
			"description": "Adds discord invitations to an embed"
		};
		this.emoteServer = this.client.guilds.cache.get(EMOTE_SERVER_ID);
	}
		
	async run(message, args) {
		try {			
			switch (args[0]) {
			case "add": 	await this.add(message, args.slice(1)); break;
			case "remove": 	await this.remove(message, args.slice(1)); 	break;
			case "publish": this.publish(message, args.slice(1)); 	break;
			case "list": 	this.list(message, args.slice(1));	 	break;
			}
		} catch (e) {
			let errorEmbed = this.client.createEmbed("error").setTitle(e);
			message.channel.send(errorEmbed);
		}
	}
	
	async add(message, args) {
		let inviteText = args[0];
		if (!inviteText) throw "You must provide an invite link!";
		
		let invite = await this.client.fetchInvite(inviteText);
		let name = invite.guild.name;
		let emote = await this.createEmote(invite.guild);
	
		await this.client.db.async_run("REPLACE INTO discord_links VALUES (?, ?, ?)", { params: [name, invite.url, emote.identifier] });
		let responseEmbed = this.client.createEmbed("result").setTitle(`Successfully added ${name}! <:${emote.identifier}>`);
		message.channel.send(responseEmbed);
	}
	
	async createEmote(guild) {
		let emoteName = guild.name.toLowerCase()
			.replace(/[^\w ]/g, "")
			.replace(/ /g, "_");
		let iconURL = guild.iconURL({ format: "png" });
		
		let canvas = Canvas.createCanvas(128, 128);
		let context = canvas.getContext("2d");
		let image = await Canvas.loadImage(iconURL);
		context.beginPath();

		// How to draw a rounded Rectangle on HTML Canvas?
		// https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
		context.moveTo(128, 128);
		context.arcTo(0, 128, 0, 0, 40);
		context.arcTo(0, 0, 128, 0, 40);
		context.arcTo(128, 0, 128, 128, 40);
		context.arcTo(128, 128, 0, 128, 40);
		context.clip();
		
		context.drawImage(image, 0, 0, 128, 128);
		context.closePath();
		
		let buffer = canvas.toDataURL();
		return this.emoteServer.emojis.create(buffer, emoteName);
	}
	
	async remove(message, args) {
		let name = args.join(" ");
		if (!name) throw "You must provide a guild name!";
		
		let emoteResult = await this.client.db.async_get("SELECT emote_id FROM discord_links WHERE name = ?", { params: [name] });
		if (!emoteResult) throw `Couldn't find '${name}' in the database`;
		let emoteID = emoteResult.emote_id;
		emoteID = emoteID.substring(emoteID.indexOf(":") + 1); // Gets the snowflake
		
		let emote = await this.emoteServer.emojis.resolve(emoteID);
		await emote.delete();
		
		await this.client.db.async_run("DELETE FROM discord_links WHERE name = ?", { params: [name] });
		let responseEmbed = this.client.createEmbed("result").setTitle(`Successfully delete '${name}' from the discord links!`);
		message.channel.send(responseEmbed);
	}
	
	publish(message, args) {
		
	}
	
	list(message, args) {
		
	}
}

module.exports = Links;
