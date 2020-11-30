"use strict";

const Command = require("@root/src/commands/Command.js");

class Project extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Projects System",
			"usage": "project",
			"description": "Manage projects for the projects system"
		};
		this.config = this.client.moduleConfig["Projects System"];
		this.category = this.client.channels.cache.get(this.config["category-id"]);
	}

	async run(message, args) {
		try {
			switch (args[0]) {
			case "init":
				await this.init(message, args[1], args[2]);
			}
		} catch (e) {
			console.log(e);
		}
	}

	async init(message, name, flag) {
		if (name === undefined) {
			await message.channel.send("Invalid Usage");
			return;
		}
		if (flag === undefined) {
			flag = "undecided";
		}
		await message.channel.send("Please enter a description");
		const collector = message.channel.createMessageCollector(m => m.author === message.author && m.channel === message.channel, {time: 30000});

		collector.once("collect", async m => {
			let description = m.content;
			await message.channel.send("Please enter coordinates");
			collector.once("collect", async m => {
				let coords = m.content;
				let projectChannel = await message.guild.channels.create(name, {parent: this.category});
				await projectChannel.setTopic(`Coordinates: ${coords}| Leader ${message.author.username}`);

				await this.client.db.async_run(
					"INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
					{
						params: [
							name, flag.replace("--", ""), description, projectChannel.id, message.author.id, message.author.id, coords, "", ""
						]
					}
				);
			});
		});
		collector.on("end", async collected => await message.channel.send("Your request has timed out!"));
	}
}

module.exports = Project;
