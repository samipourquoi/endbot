"use strict";

const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const Command = require("../Command");

class Backup extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Backup",
			"usage": "backup | backup [Server Name]",
			"description": "Backups a server."
		};
	}

	run(message, args) {
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
				this.backup(serverPath);

				return;
			}
		}

		message.channel.send("You must be in a bridge channel to do that!");
	}

	backup(serverPath) {
		if (!fs.existsSync("./backups")) {
			fs.mkdirSync("./backups");
		}

		let date = new Date();
		let month = date.getMonth().toString().padStart(2, "0");
		let day = date.getDate().toString().padStart(2, "0");
		let year = date.getFullYear();
		let hours = date.getHours().toString().padStart(2, "0");
		let minutes = date.getMinutes().toString().padStart(2, "0");
		let seconds = date.getSeconds().toString().padStart(2, "0");

		// on_08-20-2020_at_01-10-07.tar.gz
		let backupName = `on_${month}-${day}-${year}_at_${hours}-${minutes}-${seconds}.${this.client.config["backup-format"]}`;
		console.log(backupName);

		exec(`cd /${serverPath} && tar --exclude="./server.jar" -zcvf ${process.cwd()}/backups/${backupName} .`);

		console.log("backup taken!");
	}
}

module.exports = Backup;
