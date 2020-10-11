"use strict";

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { error, generate } = require("../../misc/embeds.js");

const Command = require("../Command");

class Backup extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Backup",
			"usage": "backup",
			"description": "Backups a server"
		};
	}

	async run(message) {
		if (!message.member.roles.cache.has(this.client.config["backup-role"])) {
			message.channel.send("da fuck you tryin' to do");
			return;
		}

		let servers = this.client.config.servers;
		let keys = Object.keys(servers);

		for (let i = 0; i < keys.length; i++) {
			let server = servers[keys[i]];

			if (server["bridge-channel"] == message.channel.id) {
				let serverPath = path.parse(path.parse(server["log-path"]).dir).dir;
				let rcon = this.client.bridges.get(message.channel.id).rcon;

				let embed = generate("result");
				embed.setTitle("Backup is running...");
				message.channel.send(embed);

				let backupName = await this.backup(rcon, serverPath);

				embed = generate("result")
					.setTitle("Backup is finished!")
					.setFooter(`${backupName}`);
				message.channel.send(embed);

				return;
			}
		}

		let embed = generate("error")
			.setTitle("You must be in a bridge channel to do that!");
		message.channel.send(embed);
	}

	async backup(rcon, serverPath) {
		if (!fs.existsSync("./backups")) {
			fs.mkdirSync("./backups");
		}

		await rcon.sendCommand("save-off");
		await rcon.warn("A backup is starting...");

		let date = new Date();
		let month = (date.getMonth() + 1).toString().padStart(2, "0");
		let day = date.getDate().toString().padStart(2, "0");
		let year = date.getFullYear();
		let hours = date.getHours().toString().padStart(2, "0");
		let minutes = date.getMinutes().toString().padStart(2, "0");
		let seconds = date.getSeconds().toString().padStart(2, "0");

		// on_08-20-2020_at_01-10-07_Server.tar.gz
		let backupName = `on_${month}-${day}-${year}_at_${hours}-${minutes}-${seconds}_${rcon.name}.${this.client.config["backup-format"]}`;
		
		execSync(`cd /${serverPath} && tar --exclude="./server.jar" -zcf ${process.cwd()}/backups/${backupName} .`, { stdio: "inherit" });

		await rcon.sendCommand("save-on");
		await rcon.succeed("The backup is finished!");

		return backupName;
	}
}

module.exports = Backup;
