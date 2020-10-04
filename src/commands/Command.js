"use strict";

class Command {
	constructor(client) {
		this.client = client;
		this.info = {
			"name": "Command Template",
			"usage": "cmd",
			"description": "Template of a command description"
		};
	}
	
	get name() {
		return this.info.name;
	}
	
	get usage() {
		return this.info.usage;
	}
	
	get description() {
		return this.info.description;
	}
	
	toString() {
		return `**${this.name}**: ${this.description}; \`${this.usage}\``;
	}
}

module.exports = Command;
