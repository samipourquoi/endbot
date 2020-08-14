"use strict";

const Net = require("net");
const Packet = require("./Packet");

class Rcon {
	constructor(host, port, password, name) {
		this.host = host;
		this.port = port;
		this.password = password;
		this.name = name;

		// this.client = new Net.Socket();
		this.client = Net.createConnection({
			host: this.host,
			port: this.port
		}, () => {
			this.authenticate();
		});
	}

	authenticate() {
		let packet = new Packet(this.generateId(), 3, this.password);
		this.client.write(packet.buffer);

		let promise = new Promise(
			(resolve, reject) => {
				this.client.once("data", data => {
					let response = Packet.read(data);
					if (response.id == packet.id) resolve(response);
					else reject(`Couldn't authenticate to ${this.name} Rcon`);
				});
			}
		);

		promise.then(response => {
			console.log(`Connected to ${this.name} Rcon`);
		}).catch(err => {
			console.error(err);
		});
	}

	generateId() {
		return Math.floor(Math.random() * Math.floor(2**16));
	}
}

module.exports = Rcon;
