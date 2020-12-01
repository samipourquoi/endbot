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
				break;
			case "add":
				await this.addMember(message, args[2]);
				break;
			case "list":
				await this.listMembers(message);
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
		} else flag = flag.replace("--", "");

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
							name, flag, description, projectChannel.id, message.author.id, message.author.id,coords, "", ""
						]
					}
				);
			});
		});
		collector.on("end", async collected => await message.channel.send("Your request has timed out!"));
	}

	async addMember(message, flag) {
		if (await this.isProject(message.channel.id) && await this.isLeader(message.channel.id, message.author)) {
			let member = message.guild.member(message.mentions.users.first());
			let members = await this.client.db.async_get("SELECT members FROM projects WHERE channel_id = ?", {params: message.channel.id});
			members = members["members"].toString();

			if (!members.includes(member.id)) {
				members = members + `,${member.id}`;
				await this.client.db.async_run("UPDATE projects SET members = ? WHERE channel_id = ?", {params: [members, message.channel.id]});
				await message.channel.send(`Added ${member.user.username} to this project`);
			} else  if (flag === undefined) {
				await message.channel.send("They are already a member of this project");
			}

			if (flag === "--leader") {
				let leaders = await this.client.db.async_get("SELECT leaders FROM projects WHERE channel_id = ?", {params: message.channel.id});
				leaders = leaders["leaders"];

				if (!leaders.includes(member.id)) {
					leaders = leaders + `,${member.id}`;
					await this.client.db.async_run("UPDATE projects SET leaders = ? WHERE channel_id = ?", {params: [leaders, message.channel.id]});
					await message.channel.send(`Added ${member.user.username} as a leader to this project`);
					await message.channel.setTopic(message.channel.topic + `, ${member.user.username}`);

				} else {
					await message.channel.send("They are already a leader of this project");
				}
			} else  if (flag !== undefined){
				await message.channel.send("Invalid usage");
			}
		}
	}

	async listMembers(message) {
		if (await this.isProject(message.channel.id)) {
			let memberIDS = await this.client.db.async_get("SELECT members FROM projects WHERE channel_id = ?", {params: message.channel.id});
			memberIDS = memberIDS["members"].toString().split(",");
			let members = [];

			for (let i = 0; i < memberIDS.length; i++) {
				let member = message.guild.members.cache.get(memberIDS[i]);
				members.push(member.user.username);
			}

			await message.channel.send(`The members of this project are:\n ${members.join("\n")}`);
		}
	}

	async isProject(channel_id) {
		let project = await this.client.db.async_get("SELECT * FROM projects WHERE channel_id = ?", {params: channel_id});
		return (project !== undefined);
	}

	async isLeader(channel_id, member) {
		let leaders = await this.client.db.async_get("SELECT leaders FROM projects WHERE channel_id =?", {params: channel_id});
		return (leaders["leaders"].toString().includes(member.id));
	}

}

module.exports = Project;
