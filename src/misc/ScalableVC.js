"use strict";

let config;

try {
	config = require("../../config.json");
} catch (e) {
	console.error("Unable to load config");
	process.exit(1);
}

class ScalableVC {
	constructor(){
		console.log("Scalable VC Activated");
		this.canWork = true;
		this.load();
	}

	voiceEvent(oldState, newState){
		if(!this.canWork) return;

		// Setup class variables for other methods
		this.oldState = oldState.channel;
		this.newState = newState.channel;

		// Figure out what has actually happened
		if(this.oldState === null){
			// Old state was nothing, someone has joined
			this.joinAction();
		} else if(this.newState === null){
			// New state is nothing, someone has left
			this.leaveAction();
		} else if(this.newState.id !== this.oldState.id){
			// Something else happened. Check that the id is not the same, therefore the person has moved channels.
			// If the person stays in the same channel they have (been) muted/deafened
			this.leaveAction();
			this.joinAction();
		}
	}

	async joinAction(){
		// Let's check if the person wants to create a new channel
		if(this.newState.name !== config.scalableVC.createChannelName) return;

		// Move channel name to active list
		let channelName = this.availableChannelNames.pop();
		this.activeChannelNames.push(channelName);

		console.log("[ScalableVC] Creating a new VC (", channelName, ")");

		// Set the current VC to the channel name
		await this.newState.setName(channelName);

		// Check if a joinable channel exists
		let foundCreateChannel = false;
		this.newState.guild.channels.cache.forEach(function(item){
			if(item.type !== "voice") return;
			console.log("Testing", item.name);
			if(foundCreateChannel) return;
			if(item.name === config.scalableVC.createChannelName){
				foundCreateChannel = true;
				console.log("Found + channel");
			}
		});

		// Create a new joinable channel
		console.log(foundCreateChannel);
		if(foundCreateChannel === false){
			console.log("Creating new channel");
			this.newState.guild.channels.create(config.scalableVC.createChannelName,{"parent": config.scalableVC.categoryId, "type": "voice"});
		}
	}

	leaveAction(){
		// Check this is a channel we can delete
		if(!this.activeChannelNames.includes(this.oldState.name)) return;

		// Cache the active channel name list
		let acn = this.activeChannelNames;

		// Find the index of the channel that was left in the array
		let found = false;
		let foundIndex;
		for(let i=0; i<acn.length && !found; i++){
			if(acn[i] === this.oldState.name){
				found = true;
				foundIndex = i;
			}
		}

		// Check the vc is actually empty before taking action
		if(this.oldState.members.size !== 0) return;

		console.log("Removing", acn[foundIndex], "as it's empty");

		// Looks confusing, but just swapping the element we want to the end
		[acn[foundIndex], acn[acn.length - 1]] = [acn[acn.length - 1], acn[foundIndex]];

		// Make Channel name available again
		let channelName = acn.pop();
		this.availableChannelNames.push(channelName);

		// Yeet vc
		this.oldState.delete();
	}

	load(){
		console.log("Loading ScalableVC");
		this.availableChannelNames = config.scalableVC.channelNames;
		this.activeChannelNames = [];
	}

	reset(message){
		console.log("Resetting ScalableVC System");
		this.load();

		let foundCreateChannel = false;
		let channels = message.guild.channels.cache;
		let availableChannelNames = this.availableChannelNames;
		let changesMade = false;
		channels.forEach(function (item) {
			if(item.type !== "voice") return;

			if(foundCreateChannel && item.name === config.scalableVC.createChannelName){
				console.warn("Removed duplicate create channel");
				item.delete();
				changesMade = true;
			}

			if(item.name === config.scalableVC.createChannelName) foundCreateChannel = true;

			if(availableChannelNames.includes(item.name)) {
				console.warn("Removed channel named", item.name);
				item.delete();
				changesMade = true;
			}
		});

		// If we don't have the required channel, make one
		if(!foundCreateChannel) this.newState.guild.channels.create(config.scalableVC.createChannelName,{"parent": config.scalableVC.categoryId, "type": "voice"});

		if(!changesMade) console.log("[ResetSVC] No Changes were made");

		message.react("✅");
	}

	toggle(message){
		this.canWork = !this.canWork;

		if(this.canWork){
			message.react("🟩");
		} else {
			message.react("🟥");
		}

		message.react("✅");
	}
}

module.exports = new ScalableVC();
