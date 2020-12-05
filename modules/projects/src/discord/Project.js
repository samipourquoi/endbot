"use strict";

const Command = require("@root/src/commands/Command.js");
const {generate} = require("@util/embeds.js");

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
		this.projectTypes = ["--dig", "--design", "--build"];
	}

	async run(message, args) {
		try {
			switch (args[0]) {
			case "init":
				if (args[1] === undefined) {
					throw "No name provided";
				} else if (!this.projectTypes.includes(args[2]) && args[2] !== undefined) {
					throw "That is not a valid type";
				} else if (args[2] === undefined) {
					args[2] = "undecided";
				}
				await this.init(message, args[1], args[2]);
				break;
			case "add":
				await this.addMember(message, args[2]);
				break;
			case "list":
				await this.listMembers(message);
				break;
			case "update":
				if (!this.projectTypes.includes(args[1]) && args[1] !== undefined) {
					throw "That is not a valid type";
				}
				await this.update(message, args[1]);
				break;
			case "status":
				await this.status(message);
				break;
			case "schematic":
				await this.schematic(message, args[1]);
				break;
			}
		} catch (e) {
			await message.channel.send(generate("error").setTitle(e));
		}
	}

	async messageCollector(message, time=30000, filter= m=> m.author === message.author && m.channel === message.channel) {
		try {
			const collected = await message.channel.awaitMessages(filter,  { max: 1, time: time });
			message.channel.send(generate("result").setTitle("Your response has been recorded"));
			return collected.first();
		} catch(collected) {
			throw "Your request has timed out";
		}
	}

	async init(message, name, flag) {
		await message.channel.send(generate("endtech").setTitle("Please enter a description"));
		let description = await this.messageCollector(message);
		description = JSON.stringify([description.content]);

		await message.channel.send(generate("endtech").setTitle("Please enter coords"));
		const filter = m => {
			return m.author === message.author && m.channel === message.channel && this.valid_coords(m.content);
		};
		let coords = await this.messageCollector(message, 30000, filter);
		
		let projectChannel = await message.guild.channels.create(name, {parent: this.category});
		await projectChannel.setTopic(`Coordinates: ${coords.content} | Leader(s): ${message.author.username}`);
		
		let memberID = JSON.stringify([message.author.id]);

		await this.client.db.async_run(
			"INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			{
				params: [
					name, flag.replace("--", ""), description, projectChannel.id, memberID, memberID, coords.content, "[]", "[]"
				]
			});
	}

	async addMember(message, flag) {
		if (await this.isProject(message.channel.id) && await this.isLeader(message.channel.id, message.author)) {
			let member = message.guild.member(message.mentions.users.first());
			let { members } = await this.client.db.async_get("SELECT members FROM projects WHERE channel_id = ?", {params: message.channel.id});
			members = JSON.parse(members);

			if (!members.includes(member.id)) {
				members.push(member.id);
				await this.client.db.async_run("UPDATE projects SET members = ? WHERE channel_id = ?", {params: [JSON.stringify(members), message.channel.id]});
				await message.channel.send(generate("result").setTitle(`Added ${member.user.username} to this project`));
			} else if (flag === undefined) {
				throw "They are already a member";
			}

			if (flag === "--leader") {
				let { leaders } = await this.client.db.async_get("SELECT leaders FROM projects WHERE channel_id = ?", {params: message.channel.id});
				leaders = JSON.parse(leaders);

				if (!leaders.includes(member.id)) {
					leaders.push(member.id);
					await this.client.db.async_run("UPDATE projects SET leaders = ? WHERE channel_id = ?", {params: [JSON.stringify(leaders), message.channel.id]});
					await message.channel.send(generate("result").setTitle(`Added ${member.user.username} as a leader to this project`));
					await message.channel.setTopic(leaders.join(","));

				} else {
					throw "They are already a leader";
				}
			} else if (flag !== undefined) {
				throw "Invalid Usage";
			}
		}
	}

	async listMembers(message) {
		if (await this.isProject(message.channel.id)) {
			let {members} = await this.client.db.async_get("SELECT members FROM projects WHERE channel_id = ?", {params: message.channel.id});
			members = JSON.parse(members);
			let memberNames = [];

			for (let i = 0; i < members.length; i++) {
				let member = message.guild.members.cache.get(members[i]);
				memberNames.push(member.user.username);
			}

			await message.channel.send(`The members of this project are:\n ${memberNames.join("\n")}`);
		}
	}

	async update(message, type) {
		if (await this.isProject(message.channel.id) && (await this.isMember(message.channel.id, message.author))) {
			if (type !== undefined) {
				await this.client.db.async_run("UPDATE projects SET type = ? WHERE channel_id = ?", {params: [type.replace("--", ""), message.channel.id]});
				return;
			}
			let { reports } = await this.client.db.async_get("SELECT reports FROM projects WHERE channel_id  = ?", {params: message.channel.id});
			reports = JSON.parse(reports);

			await message.channel.send(generate("endtech").setTitle("Please give a progress report"));
			let report = await this.messageCollector(message, 120000);
			reports.push(report.content);
			await this.client.db.async_run("UPDATE projects SET reports = ? WHERE channel_id = ?", {params: [JSON.stringify(reports), message.channel.id]});
		}
	}

	async status(message) {
		if (await this.isProject(message.channel.id)) {
			let {type} = await this.client.db.async_get("SELECT type FROM projects WHERE channel_id = ?", {params: message.channel.id});
			let {reports} = await this.client.db.async_get("SELECT reports FROM projects WHERE channel_id = ?", {params: message.channel.id});
			reports = JSON.parse(reports);
			let latestReport = reports[reports.length - 1];

			await message.channel.send(`Type: ${type}`);
			await message.channel.send(`**Latest Report:** ${latestReport}`);
		}
	}

	async schematic(message, flag) {
		if (await this.isProject(message.channel.id)) {
			let {schematic} = await this.client.db.async_get("SELECT schematic FROM projects WHERE channel_id = ?", {params: message.channel.id});
			schematic = JSON.parse(schematic);

			if (flag === "--add" && await this.isMember(message.channel.id, message.author)) {
				await message.channel.send("Please upload a litematic with the placement coords `x,y,z`");

				const filter = m => {
					return m.author === message.author && m.channel === message.channel && this.valid_coords(m.content) && m.attachments.size > 0;
				};

				let schematicMessage = await this.messageCollector(message, 90000, filter);
				let schematicURL = schematicMessage.attachments.first();
				schematicURL.placement = schematicMessage.content;

				if (schematicURL.attachment.endsWith(".litematic")) {
					schematic.push(schematicURL);
					await this.client.db.async_run("UPDATE projects SET schematic = ? WHERE channel_id = ?", {params: [JSON.stringify(schematic), message.channel.id]});
				} else throw "I said a litematic...";

			} else if (schematic.length < 1) {
				throw "This project currently has no associated schematics, you can add one by using the --add flag";
			} else {
				let schematicEmbed = generate("endtech")
					.setTitle("Schematics List");

				for (let i = 0; i < schematic.length; i++) {
					let currentSchematic = schematic[i];
					schematicEmbed.addField(currentSchematic.name.replace(".litematic", ""),
						`[Download Link](${currentSchematic.url})| Placement: ${currentSchematic.placement}`);
				}
				await message.channel.send(schematicEmbed);
			}
		}
	}

	valid_coords(points) {
		try {
			let coords = JSON.parse("[" + points + "]");
			return coords.every(e => {
				return (typeof e === "number");
			});
		} catch (e) {
			return false;
		}
	}

	async isProject(channel_id) {
		let project = await this.client.db.async_get("SELECT * FROM projects WHERE channel_id = ?", {params: channel_id});
		return (project !== undefined);
	}

	async isMember(channel_id, member) {
		let { members } = await this.client.db.async_get("SELECT members FROM projects WHERE channel_id =?", {params: channel_id});
		return (members.toString().includes(member.id));
	}

	async isLeader(channel_id, member) {
		let { leaders } = await this.client.db.async_get("SELECT leaders FROM projects WHERE channel_id =?", {params: channel_id});
		return (leaders.toString().includes(member.id));
	}

}

module.exports = Project;
