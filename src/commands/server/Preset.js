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
			case "add": 	add(rcon, args.slice(1)); 		break;
			case "remove": 	remove(rcon, args.slice(1)); 	break;
			case "list": 	list(rcon, args.slice(1)); 		break;
			case "display": display(rcon, args.slice(1)); 	break;
			case "delay": 	delay(rcon, args.slice(1)); 	break;
		}
	}
	
	display(rcon, args) {
		
	}
	
	add(rcon, args) {
		
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
