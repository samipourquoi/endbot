"use strict";

const Net = require("net");
const Packet = require("./Packet");

/**
 * Class representing a single instance of an Rcon.
 */
class Rcon {
	constructor({ host, port, password, name }, client) {
		this.host = host;
		this.port = port;
		this.password = password;
		this.name = name;
		this.timeout = 8000;

		this.client = client;

		let connect = () => {
			console.log(`Connecting to ${this.name} Rcon...`);
			this.connection = Net.createConnection({
				host: this.host,
				port: this.port
			}, () => {
				this.authenticate()
					.then(console.log)
					.catch(console.error);
			});
		};

		connect();

		this.connection.on("error", e => {
			console.error(e);
			console.error(`Couldn't connect to ${this.name} Rcon. Retrying in 5 seconds.`);
			setTimeout(connect, 5*1000);
		});
	}

	authenticate() {
		let packet = new Packet(this.generateId(), 3, this.password);
		this.connection.write(packet.buffer);

		let promise = new Promise((resolve, reject) => {
			this.connection.once("data", data => {
				let response = Packet.read(data);
				if (response.id != packet.id) reject(`Couldn't authenticate to ${this.name} Rcon`);

				this.connection.emit("auth");
				resolve(`Running ${this.name} Rcon`);
			});
		});

		return promise;
	}

	sendCommand(command) {
		let packet = new Packet(this.generateId(), 2, command);
		this.connection.write(packet.buffer);

		return new Promise((resolve, reject) => {
			this.connection.once("data", data => {
				resolve(Packet.read(data));
			});
			setTimeout(() => {
				reject("Timeout exceeded");
			}, this.timeout);
		});
	}

	sendMessage(message, meta) {
		let tellraw = "";
		if (meta != undefined) {
			tellraw = `tellraw @a ["[", {"text":"${meta.author}","color":"${meta.color}"},"]",{"text":"${message}","color":"white"}]`;
		} else {
			tellraw = `tellraw @a {"text":"${message}","color":"white"}`;
		}

		return this.sendCommand(tellraw);
	}

	generateId() {
		return Math.floor(Math.random() * Math.floor(2**16));
	}

	log(...args) {
		return this.sendCommand(`tellraw @a {"text": "${args.join("")}", "color": "red"}`);
	}

	succeed(...args) {
		return this.sendCommand(`tellraw @a {"text": "${args.join("")}", "color": "green"}`);
	}

	warn(...args) {
		return this.sendCommand(`tellraw @a {"text": "${args.join("")}", "color": "gold"}`);
	}

	error(...args) {
		return this.sendCommand(`tellraw @a {"text": "${args.join("")}", "color": "red"}`);
	}
}

module.exports = Rcon;
