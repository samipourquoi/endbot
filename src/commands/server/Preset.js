"use strict";

const ServerCommand = require("../ServerCommand.js");
const scoreboards = require("../../assets/scoreboards.json");

class Preset extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Scoreboard Preset",
			"usage": "preset <name>",
			"description": "Displays succesively a list of objectives over and over."
		};
		this.delay = 30;
		this.servers = new Map();
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
		let name = args[0];
		this.client.db.get("SELECT objectives FROM presets WHERE name = ?", [name], (err, data) => {
			if (err) rcon.error(err);
			if (data == undefined) {
				rcon.error(`No preset is assigned to ${name}`);
				return;
			}
			
			let objectives = data.objectives.split(",");
			rcon.preset.objectives = objectives;
			rcon.preset.enabled = true;
			
			rcon.sendCommand(`scoreboard objectives setdisplay sidebar ${scoreboards[objectives[0]] || objectives[0]}`);
		});
	}
	
	set(rcon, args, authorName) {
		let name = args[0];
		let input = args.slice(1).join("");
		let objectives;
		try {
			objectives = JSON.parse(input);
			if (!Array.isArray(objectives)) {
				throw new Error("not an array");
			} else if (objectives.length == 0) {
				throw new Error("can't accept empty arrays");
			} else if (!objectives.every(e => e != "")) {
				throw new Error("one or more strings are empty");
			}
		} catch (e) {
			console.error(e);
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
				else rcon.succeed(`Successfully set preset ${name} to value ${objectives}`);
			});
		});
	}
	
	remove(rcon, args) {
		
	}
	
	list(rcon, args) {
		
	}
	
	delay(rcon, args) {
		
	}
	
	/**
	 * Gets called for each server once authentified.
	 * Will loop over and over, and display the appropriate scoreboards
	 * when the presets are enabled.
	 */
	static loop(rcon) {
		setInterval(async () => {
			let preset = rcon.preset;
			if (preset.enabled) {
				preset.i++;
				preset.i %= preset.objectives.length;
				let objectiveName = preset.objectives[preset.i];
				console.log(scoreboards[objectiveName] || objectiveName);
				await rcon.sendCommand(`scoreboard objectives setdisplay sidebar ${scoreboards[objectiveName] || objectiveName}`);
			}
		}, 10000);
	}

	toString() {
		return this.info;
	}
}

module.exports = Preset;
