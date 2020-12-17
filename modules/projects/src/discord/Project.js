"use strict";

const Command = require("@root/src/commands/Command.js");
const { generate } = require("@util/embeds.js");
const https = require("https");

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
			case "members":
				await this.members(message, args[1], args[3]);
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
			case "materials":
				await this.matList(message, args[1]);
				break;
			case "dig":
				await this.dig(message, args[1]);
				break;
			case "convert":
				if (!this.projectTypes.includes(args[1]) && args[1] !== undefined) {
					throw "That is not a valid type";
				} else if (args[1] === undefined) {
					args[1] = "undecided";
				}

				await this.convert(message, args[1]);
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
			"INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			{
				params: [
					name, flag.replace("--", ""), description, projectChannel.id, memberID, memberID, coords.content, "[]", "[]", "[]"
				]
			});

		await message.channel.send(generate("result").setTitle(`${name} has been created!`));
		let projectDescription = await projectChannel.send(generate("endtech").setTitle(`${name}`)
			.setDescription(JSON.parse(description)[0]));
		await projectDescription.pin();
	}

	async convert(message, flag) {
		await message.channel.send(generate("endtech").setTitle("Please enter a description"));
		let description = await this.messageCollector(message);
		description = JSON.stringify([description.content]);

		await message.channel.send(generate("endtech").setTitle("Please enter coords"));
		const filter = m => {
			return m.author === message.author && m.channel === message.channel && this.valid_coords(m.content);
		};
		let coords = await this.messageCollector(message, 30000, filter);

		let projectChannel = message.channel;
		await projectChannel.setTopic(`Coordinates: ${coords.content} | Leader(s): ${message.author.username}`);

		let memberID = JSON.stringify([message.author.id]);

		await this.client.db.async_run(
			"INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			{
				params: [
					projectChannel.name, flag.replace("--", ""), description, projectChannel.id, memberID, memberID, coords.content, "[]", "[]", "[]"
				]
			});

		await message.channel.send(generate("result").setTitle("This channel is now a project channel!"));
		let projectDescription = await projectChannel.send(generate("endtech").setTitle(`${projectChannel.name}`)
			.setDescription(JSON.parse(description)[0]));
		await projectDescription.pin();
	}

	async members(message, flag, leaderFlag) {
		if (await this.isProject(message.channel.id)) {
			let { members } = await this.client.db.async_get("SELECT members FROM projects WHERE channel_id = ?", {params: message.channel.id});
			members = JSON.parse(members);

			if (flag === undefined) {
				let memberNames = [];

				for (let i = 0; i < members.length; i++) {
					let member = message.guild.members.cache.get(members[i]);
					memberNames.push(member.user.username);
				}

				await message.channel.send(generate("result").setTitle("The members of this project are").setDescription(memberNames.join("\n")));

			} else if (flag === "--add" && await this.isLeader(message.channel.id, message.author)) {
				let member = message.guild.member(message.mentions.users.first());

				if (!members.includes(member.id) && leaderFlag === undefined) {
					members.push(member.id);
					await this.client.db.async_run("UPDATE projects SET members = ? WHERE channel_id = ?", {params: [JSON.stringify(members), message.channel.id]});
					await message.channel.send(generate("result").setTitle(`Added ${member.user.username} to this project`));
				} else if (members.includes(member.id)) throw "They are already a members";

				if (leaderFlag === "--leader") {
					let { leaders } = await this.client.db.async_get("SELECT leaders FROM projects WHERE channel_id = ?", {params: message.channel.id});
					leaders = JSON.parse(leaders);

					if (!leaders.includes(member.id)) {
						leaders.push(member.id);
						await this.client.db.async_run("UPDATE projects SET leaders = ? WHERE channel_id = ?", {params: [JSON.stringify(leaders), message.channel.id]});
						await message.channel.send(generate("result").setTitle(`Added ${member.user.username} as a leader to this project`));
						await message.channel.setTopic(message.channel.topic + `, ${member.user.username}`);
					} else throw "They are already a leader";
				}
			}
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

			let isDig = false;
			let { digCoords } = await this.client.db.async_get("SELECT digCoords FROM projects WHERE channel_id = ?", {params: message.channel.id});
			digCoords = JSON.parse(digCoords);
			if (digCoords.length > 0) isDig = true;

			let statusEmbed = generate("endtech").setTitle(`Project Status | Type: ${type}`)
				.setDescription(latestReport);

			if (isDig) {
				let rcon = this.client.bridges.get(this.client.config.servers[0]["bridge-channel"]).rcon;
				let yLevels = [];
				let count = {};

				while (yLevels.length < 5) {
					let points = this.getDigRandomCoords(digCoords);
					let data = await rcon.sendCommand(`/script run top('surface',${points[0]}, 0, ${points[1]})`);
					yLevels.push(data.body.split(" ")[2]);
				}

				for (let i=0; i < yLevels.length; i++) {
					if (!count[yLevels[i]]) count[yLevels[i]] = 0;
					count[yLevels[i]] += 1;
				}

				let currentYLevel = Object.keys(count).reduce((a, b) => count[a] > count[b] ? a:b);
				statusEmbed.addField("Current Dig Layer", currentYLevel);
			}
			await message.channel.send(statusEmbed);
		}
	}

	async dig(message, flag) {
		if (await this.isProject(message.channel.id) && this.isMember(message.channel.id, message.author)) {
			let { digCoords } = await this.client.db.async_get("SELECT digCoords FROM projects WHERE channel_id = ?", {params: message.channel.id});
			if (JSON.parse(digCoords).length > 0 && flag === undefined) throw "There is already a dig happening for this project";

			if (flag === "--alter" || flag === undefined) {
				await message.channel.send(generate("endtech").setTitle("Please enter the points of all the vertices of the dig [x,z], [x,z] (In order)"));
				let digCoordsMessage = await this.messageCollector(message, 60000);

				const validDigCoords = (coords) => {
					try {
						coords = JSON.parse(`[ ${coords} ]`);

						return coords.every(c => c.every(v => typeof v === "number"));
					} catch (e) {
						return false;
					}
				};
				if (!validDigCoords(digCoordsMessage.content)) throw "Invalid Dig Coords!";
				digCoordsMessage = JSON.stringify(JSON.parse(`[${digCoordsMessage.content}]`));

				await this.client.db.async_run("UPDATE projects SET digCoords = ? WHERE channel_id = ?", {params: [digCoordsMessage, message.channel.id]});
			} else if (flag === "--stop") {
				if (JSON.parse(digCoords).length === 0) throw "There are no digs currently happening for this project";

				await this.client.db.async_run("UPDATE projects SET digCoords = ? WHERE channel_id = ?", {params: ["[]", message.channel.id]});
				await message.channel.send(generate("result").setTitle("The dig for this project has now ended"));
			}
		}
	}

	async schematic(message, flag) {
		if (await this.isProject(message.channel.id)) {
			let {schematic} = await this.client.db.async_get("SELECT schematic FROM projects WHERE channel_id = ?", {params: message.channel.id});
			schematic = JSON.parse(schematic);

			if (flag === "--add" && await this.isMember(message.channel.id, message.author)) {
				await message.channel.send(generate("endtech").setTitle("Please upload a litematic with the placement coords `x,y,z`"));

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

	async matList(message, flag) {
		if (await this.isProject(message.channel.id)) {
			let { matList } = await this.client.db.async_get("SELECT matList FROM projects WHERE channel_id = ?", {params: message.channel.id});
			matList = JSON.parse(matList);

			if (flag === "--add" && await this.isMember(message.channel.id, message.author)) {
				await message.channel.send(generate("endtech").setTitle("Please upload a text file of the material list"));

				const filter = m => {
					return m.author === message.author && m.channel === message.channel && m.attachments.size > 0;
				};

				let matListMessage = await this.messageCollector(message, 90000, filter);
				let matListURL = matListMessage.attachments.first();

				let data = "";

				const getMats = (url) => {
					return new Promise((resolve) => {
						https.get(url, res => {
							res.on("data", chunk => {
								data += chunk;
							});

							res.on("end", () => {
								resolve(data);
							});
						});
					});
				};

				let mats = await getMats(matListURL.url);
				mats = mats.split("\n").slice(5, -4).map(r => r.substring(2, r.length -2).split("|").map(c => c.trim())).map(e => e.slice(0, -2)).map(m => m.join("-"));

				if (mats.map(m => m.length).reduce((a,b) => a +b, 0) < 1024) {
					matListURL.content = mats;
				} else matListURL.content = ["Too large to display"];

				if (matListURL.attachment.endsWith(".txt")) {
					matList.push(matListURL);
					await this.client.db.async_run("UPDATE projects SET mat_list = ? WHERE channel_id = ?", {params: [JSON.stringify(matList), message.channel.id]});
				} else throw "A text file please";

			} else if (matList.length < 1) {
				throw "This project currently has no associated material lists, you can add one by using the --add flag";
			} else {
				let matListEmbed = generate("endtech")
					.setTitle("Materials List");

				for (let i = 0; i < matList.length; i++) {
					let currentMatList = matList[i];
					matListEmbed.addField(currentMatList.name.replace(".txt", ""),
						`**[Download Link](${currentMatList.url})**\n Materials:\n ${currentMatList.content.join("\n")}`);
				}
				await message.channel.send(matListEmbed);
			}
		}

	}

	getDigRandomCoords (points) {
		let xMin = Math.min(...points.map(p => p[0]));
		let xMax = Math.max(...points.map(p => p[0]));
		let yMin = Math.min(...points.map(p => p[1]));
		let yMax = Math.max(...points.map(p => p[1]));
		let inside = false;
		let x;
		let y;

		while (!inside) {
			x = xMin + (Math.random() * (xMax - xMin));
			y = yMin + (Math.random() * (yMax - yMin));

			for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
				let xi = points[i][0], yi = points[i][1];
				let xj = points[j][0], yj = points[j][1];

				let intersect = ((yi > y) !== (yj > y))
					&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
				if (intersect) inside = true;
			}
		}

		return [Math.floor(x), Math.floor(y)];

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
