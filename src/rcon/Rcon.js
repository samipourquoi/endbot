"use strict";

const net = require("net");

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

		this.queue = [];
		this.draining = false;

		let connect = () => {
			console.log(`Connecting to ${this.name} Rcon...`);
			this.connection = net.createConnection({
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

		return new Promise((resolve, reject) => {
			this.connection.once("data", data => {
				let response = Packet.read(data);
				if (response.id != packet.id) reject(`Couldn't authenticate to ${this.name} Rcon`);

				this.connection.emit("auth");
				resolve(`Running ${this.name} Rcon`);
			});
		});
	}

	/**
	 * Drains the pending queue.
	 * This is used to be able to send multiple
	 * packets in a small amount of time without
	 * throwing an error.
	 */
	drain() {
		if (this.draining) return;

		// Recursion messes up the "this", so we must use
		// something like that to be able to use it.
		let dis = this;
		let workerDrain = () => {
			if (dis.queue.length > 0) {
				dis.draining = true;
				let packet = dis.queue.shift();
				dis.connection.write(packet.buffer, workerDrain);
			} else {
				dis.draining = false;
			}
		};
		workerDrain();
	}

	sendCommand(command) {
		let packet = new Packet(this.generateId(), 2, command);
		this.queue.push(packet);
		this.drain();

		return new Promise((resolve, reject) => {
			this.connection.on("data", data => {
				data = Packet.read(data);
				if (data.id == packet.id) resolve(data);
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
