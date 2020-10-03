"use strict";

const ServerCommand = require("../ServerCommand.js");

class Preset extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Scoreboard Preset",
			"usage": "preset <name>",
			"description": "Displays succesively a list of objectives over and over."
		};
	}

	run(rcon, authorName, args) {
		switch (args[0]) {
			case "set": 	this.set(rcon, args.slice(1), authorName); break;
			case "remove": 	this.remove(rcon, args.slice(1)); break;
			case "list": 	this.list(rcon, args.slice(1)); break;
			case "display": this.display(rcon, args.slice(1)); break;
			case "delay": 	this.delay(rcon, args.slice(1)); break;
		}
	}
	
	display(rcon, args) {
		
	}
	
	set(rcon, args, authorName) {
		let name = args[0];
		let input = args.slice(1).join("");
		let objectives;
		try {
			objectives = JSON.parse(input);
			if (!Array.isArray(objectives)) {
				throw new Error("not an array");
			}
		} catch (e) {
			rcon.error(`Unable to parse ${input}: ${e}`);
			return;
		}
		
		// Check if there is already a preset from another user
		this.client.db.get("SELECT * FROM presets WHERE NOT username = ? AND name = ?;", [authorName, name], (err, data) => {
			if (err) rcon.error(err);
			
			// If there is, send error
			if (data != undefined) {
				rcon.error(`Preset ${name} is already used by ${data.username}`);
				return;
			}
			
			// Otherwise set the preset
			this.client.db.run("REPLACE INTO presets VALUES (?, ?, ?);", [authorName, name, objectives.toString()], (err2) => {
				if (err2) rcon.error(err2);
				else rcon.succeed(`Successfully set preset ${name} to value ${objectives}`)
			});
		});
	}
	
	remove(rcon, args) {
		
	}
	
	list(rcon, args) {
		
	}
	
	delay(rcon, args) {
		
	}

	toString() {
		return this.info;
	}
}

module.exports = Preset;
