"use strict";

const ServerCommand = require("../ServerCommand.js");
const scoreboards = require("../../assets/scoreboards.json");

// Delay before changing of scoreboard, in seconds
let delay = 20;

class Preset extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Scoreboard Preset",
			"usage": "preset <name>",
			"description": "Displays succesively a list of objectives over and over."
		};
		this.servers = new Map();
	}

	run(rcon, authorName, args) {
		switch (args[0]) {
		case "set": 	this.set(rcon, args.slice(1), authorName); break;
		case "remove": 	this.remove(rcon, args.slice(1), authorName); break;
		case "list": 	this.list(rcon, args.slice(1)); break;
		case "display": this.display(rcon, args.slice(1)); break;
		case "delay": 	this.delay(rcon, args.slice(1)); break;
		}
	}
	
	async display(rcon, args) {
		let name = args[0];
		let result = await this.client.db.async_get("SELECT objectives FROM presets WHERE name = ?", { params: [name], rcon: rcon });
		
		if (!result) {
			rcon.error(`No preset is assigned to ${name}`);
			return;
		}
		
		let objectives = result.objectives.split(",");
		rcon.preset.objectives = objectives;
		rcon.preset.enabled = true;
		
		await rcon.sendCommand(`scoreboard objectives setdisplay sidebar ${scoreboards[objectives[0]] || objectives[0]}`);
	}
	
	async set(rcon, args, authorName) {
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
			rcon.error(`Unable to parse ${input}: ${e}`);
			return;
		}
		
		// Check if there is already a preset from another user
		let result = await this.client.db.async_get("SELECT * FROM presets WHERE NOT username = ? AND name = ?;", { params: [authorName, name] });
			
		if (result) {
			rcon.error(`Preset '${name}' is already used by '${result.username}'`);
			return;
		} else {
			await this.client.db.async_run("REPLACE INTO presets VALUES (?, ?, ?);", {
				params: [authorName, name, objectives.toString()],
				rcon: rcon
			});
			
			rcon.succeed(`Successfully set preset ${name} to value ${objectives}`);
		}
	}
	
	async remove(rcon, args, authorName) {
		let name = args[0];
		// Check if the user owns the presets
		let result = await this.client.db.async_get("SELECT * FROM presets WHERE username = ? AND name = ?;", { params: [authorName, name] });
		
		if (!result) {
			rcon.warn(`Couldn't find any preset '${name}' that you own`);
		} else {
			await this.client.db.async_run("DELETE FROM presets WHERE username = ? AND name = ?;", { params: [authorName, name], rcon: rcon });
			
			rcon.succeed(`Successfully deleted preset '${name}'`);
			rcon.preset.enabled = false;
		}
	}
	
	async list(rcon, args) {
		// /tellraw @s [{"text":"dig","color":"gray"},{"color":"white","text":": u-stone,u-diorite","hoverEvent":{"action":"show_text","value":"owned by samipourquoi"}}]
		let presets = await this.client.db.async_all("SELECT * FROM presets", { rcon: rcon });
		let messages = [];
		presets.forEach(preset => {
			messages.push(`{"text":"${preset.name}","color":"gray","hoverEvent":\
			{"action":"show_text","value":"owned by ${preset.username}"}},{"color":"white","text":": ${preset.objectives}"}`);
		});
		rcon.sendCommand(`tellraw @a [${messages.join(`,"\\n",`)}]`);
	}

	delay(rcon, args) {
		let newDelay = parseInt(args[0] || 20);
		delay = (5 < newDelay && newDelay < 60*5) ? newDelay : delay;
		rcon.succeed(`Changed delay to '${delay}'`);
	}
	
	/**
	 * Gets called for each server once authentified.
	 * Will loop over and over, and display the appropriate scoreboards
	 * when the presets are enabled.
	 */
	static async loop(rcon) {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, delay*1000));
			let preset = rcon.preset;
			if (preset.enabled) {
				preset.i++;
				preset.i %= preset.objectives.length;
				let objectiveName = preset.objectives[preset.i];
				await rcon.sendCommand(`scoreboard objectives setdisplay sidebar ${scoreboards[objectiveName] || objectiveName}`);
			}
		}
	}

	toString() {
		return this.info;
	}
}

module.exports = Preset;
