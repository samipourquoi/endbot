"use strict";

const Discord = require("discord.js");
const url = require("url");
const https = require("https");

const Command = require("../Command.js");

class EmbedEditor extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Embed Editor",
			"usage": "embed create",
			"description": "Creates and edits embeds"
		};
		this.ongoing = new Map();
	}

	run(message, args) {
		try {
			switch (args[0]) {
			case "create":
				this.create(message, args.slice(1));
				break;

			case "delete":
				this.ongoing.delete(message.author.id);
				message.channel.send(
					this.client.createEmbed("result")
						.setTitle("Successfully deleted your ongoing embed")
				);
				break;

			case "title":
				this.title(message, args.slice(1));
				break;

			case "description":
				this.description(message, args.slice(1));
				break;

			case "footer":
				this.footer(message, args.slice(1));
				break;

			case "color":
				this.color(message, args.slice(1));
				break;

			case "field":
				this.field(message, args.slice(1));
				break;

			case "publish":
				this.publish(message, args.slice(1));
				break;

			default:
				if (!this.ongoing.has(message.author.id)) {
					message.channel.send(
						this.client.createEmbed("error")
							.setTitle("You don't have an ongoing embed! Do " + this.client.prefix + "embed delete")
					);
					break;
				} else {
					message.channel.send(this.ongoing.get(message.author.id));
				}
				break;
			}
		} catch (e) {
			message.channel.send(
				this.client.errorEmbed("unexpected")
					.setDescription(e)
			);
		}
	}

	create(message, args) {
		if (this.ongoing.has(message.author.id)) {
			message.channel.send(
				this.client.createEmbed("error")
					.setTitle("You already have an ongoing embed! Do " + this.client.prefix + "embed reset")
			);
			return;
		}

		switch (args[0]) {
		case "from":
			this.createFrom(message, args.slice(1));
			break;

		default:
			// eslint-disable-next-line no-case-declarations
			let embed = new Discord.MessageEmbed();
			this.ongoing.set(message.author.id, embed);
			message.channel.send(embed);
			break;
		}
	}

	setCheck(message, args) {
		if (args[0] == undefined) {
			message.channel.send(this.client.errorEmbed("args"));
			return true;
		} else if (!this.ongoing.has(message.author.id)) {
			message.channel.send(
				this.client.createEmbed("error")
					.setTitle("You don't have an ongoing embed! Do " + this.client.prefix + "embed create")
			);
			return false;
		} else {
			return true;
		}
	}

	title(message, args) {
		if (!this.setCheck(message, args)) return;
		let embed = this.ongoing.get(message.author.id);

		let title = args.join(" ");
		if (title.match(/^".*"$/s) != null) {
			embed.setTitle(title.substring(1, title.length-1));
			message.channel.send(embed);
		} else {
			message.channel.send(this.client.errorEmbed("args"));
		}
	}

	description(message, args) {
		if (!this.setCheck(message, args)) return;
		let embed = this.ongoing.get(message.author.id);

		let description = args.join(" ");
		if (description.match(/^".*"$/s) != null) {
			embed.setDescription(description.substring(1, description.length-1));
			message.channel.send(embed);
		} else {
			message.channel.send(this.client.errorEmbed("args"));
		}
	}

	createFrom(message, args) {
		let request = new Promise((resolve, reject) => {
			let options = new URL(args[0]);
			let req = https.request(options, res => {
				res.setEncoding("utf-8");
				let data = "";
				res.on("data", d => {
					data += d;
				});
				res.on("end", () => {
					try {
						resolve(JSON.parse(data));
					} catch (e) {
						reject(e);
					}
				});
			});
			req.once("error", reject);
			req.end();
		});

		request.then(json => {
			let embed = new Discord.MessageEmbed(json);
			this.ongoing.set(message.author.id, embed);
			message.channel.send(embed);
		}).catch(err => {
			message.channel.send(
				this.client.errorEmbed("unexpected")
					.setDescription(err)
			);
		});
	}

	footer(message, args) {
		if (!this.setCheck(message, args)) return;
		let embed = this.ongoing.get(message.author.id);

		let footer = args.join(" ");
		if (footer.match(/^".*"$/s) != null) {
			embed.setFooter(footer.substring(1, footer.length-1));
			message.channel.send(embed);
		} else {
			message.channel.send(this.client.errorEmbed("args"));
		}
	}

	color(message, args) {
		if (!this.setCheck(message, args)) return;
		let embed = this.ongoing.get(message.author.id);

		let color = args.join(" ");
		if (color.match(/^#?[0-9a-fA-F]{6}$/) != null) {
			embed.setColor(color);
			message.channel.send(embed);
		} else {
			message.channel.send(this.client.errorEmbed("args"));
		}
	}

	field(message, args) {
		if (!this.setCheck(message, args)) return;
		let embed = this.ongoing.get(message.author.id);

		if (args[0] == "add") {
			let result = args.slice(1).join(" ").match(/(^".*"),(".*"),(true|false)$/s);
			if (result != null) {
				let name = result[1];
				let value = result[2];
				let inline = result[3];
				embed.addField(
					name.substring(1, name.length - 1),
					value.substring(1, value.length - 1),
					(inline == "true") ? true : false
				);
				message.channel.send(embed);
			} else {
				message.channel.send(this.client.errorEmbed("args"));
			}
		} else if (args[0] == "splice") {
			let index = args.slice(1).join(" ");
			if (index.match(/^([0-9]|1[0-9]|2[0-6])$/) != null) {
				embed.spliceFields(index, 1);
				message.channel.send(embed);
			} else {
				message.channel.send(this.client.errorEmbed("args"));
			}
		} else {
			message.channel.send(this.client.errorEmbed("args"));
		}
	}

	publish(message, args) {
		if (!this.ongoing.has(message.author.id)) {
			message.channel.send(
				this.client.createEmbed("error")
					.setTitle("You don't have an ongoing embed! Do " + this.client.prefix + "embed create")
			);
			return;
		}

		if (args[0].substring(0, 2) == "<#") {
			this.client.channels.fetch(args[0].substring(2, args[0].length-1))
				.then(channel => {
					channel.send(this.ongoing.get(message.author.id));
				});
			return;
		}

		let url_ = url.parse(args[0]);
		if (url_.hostname == "discordapp.com") {
			let urlPath = url_.pathname.split("/");
			let id = urlPath[3];
			let token = urlPath[4];
			let webhook = new Discord.WebhookClient(id, token);

			if (message.member.hasPermission("MANAGE_CHANNELS")) {
				webhook.send(this.ongoing.get(message.author.id));
				message.channel.send(this.client.createEmbed("result").setTitle("Successfully sent the embed"));
			} else {
				message.channel.send(this.client.createEmbed("result").setTitle("You don't have the require permissions to do this!"));
			}

			return;
		}
		message.channel.send(this.client.errorEmbed("args"));
	}

	toString() {
		return this.info;
	}
}

module.exports = EmbedEditor;
