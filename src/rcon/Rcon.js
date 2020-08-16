"use strict";

const Net = require("net");
const Packet = require("./Packet");

/**
 * Class representing a single instance of an Rcon.
 */
class Rcon {
	constructor(host, port, password, name) {
		this.host = host;
		this.port = port;
		this.password = password;
		this.name = name;
		this.timeout = 8000;

		// this.client = new Net.Socket();
		this.client = Net.createConnection({
			host: this.host,
			port: this.port
		}, () => {
			this.authenticate()
				.then(console.log)
				.catch(console.error);
		});
	}

	authenticate() {
		let packet = new Packet(this.generateId(), 3, this.password);
		this.client.write(packet.buffer);

		let promise = new Promise((resolve, reject) => {
			this.client.once("data", data => {
				let response = Packet.read(data);
				if (response.id != packet.id) reject(`Couldn't authenticate to ${this.name} Rcon`);

				this.client.emit("auth");
				resolve(`Running ${this.name} Rcon`);
			});
		});

		return promise;
	}

	sendCommand(command) {
		let packet = new Packet(this.generateId(), 2, command);
		this.client.write(packet.buffer);

		return new Promise((resolve, reject) => {
			this.client.once("data", data => {
				resolve(Packet.read(data));
			});
			setTimeout(() => {
				reject("Timeout exceeded");
			}, this.timeout);
		});
	}

	sendMessage(message, author) {
		let tellraw = `tellraw @a {"text":"[${author}] ${message}"}`;
		return this.sendCommand(tellraw);
	}

	generateId() {
		return Math.floor(Math.random() * Math.floor(2**16));
	}
}

module.exports = Rcon;
