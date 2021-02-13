"use strict";

const Command = require("../Command.js");

class Sql extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "SQL",
			"usage": "sql",
			"description": "Do SQL queries to the database"
		};
	}

	async run(message, args) {
		if (!message.member.roles.cache.has(this.client.config["op-role"])) {
			await message.channel.send("da fuck you tryin' to do");
			return;
		}
		
		this.client.db.async_all(args.join(" ")).then(result => {
			message.channel.send(`\`\`\`JSON\n${JSON.stringify(result, null, "\t")}\`\`\``, { split: true });
		}).catch(error => {
			message.channel.send(`\`\`\`diff\n-${error}\`\`\``);
		});
	}
}

module.exports = Sql;
