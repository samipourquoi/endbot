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

		this.packets = new Map();

		let connect = () => {
			console.log(`Connecting to ${this.name} Rcon...`);
			this.connection = net.createConnection({
				host: this.host,
				port: this.port
			}, () => {
				this.authenticate().then(() => {
					this.connection.on("data", data => {
						data = Packet.read(data);
						let resolve = this.packets.get(data.id);
						if (resolve != undefined) {
							this.packets.delete(data.id);
							resolve(data);
						}
						this.nextDrain();
					});
				}).catch(console.error);
			});
		};

		connect();

		this.connection.on("error", e => {
			console.error(`Couldn't connect to ${this.name} Rcon. Retrying in 5 seconds.`);
			if (this.client.flags.debug) console.error(e);
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
	 * Sends next pending command to theserver.
	 * It is only called when we have received a response from the previous packet.
	 * It is made to not make the client disconnect from the Rcon server.
	 *
	 * @see sendCommand
	 */
	nextDrain() {
		if (this.queue.length > 0) {
			this.draining = true;
			let packet = this.queue.shift();
			this.connection.write(packet.buffer);
		} else {
			this.draining = false;
		}
	}

	sendCommand(command) {
		let packet = new Packet(this.generateId(), 2, command);
		this.queue.push(packet);

		if (!this.draining) this.nextDrain();

		return new Promise((resolve, reject) => {
			this.packets.set(packet.id, resolve);
			setTimeout(() => {
				this.packets.delete(packet.id);
				reject("Timeout exceeded");
			}, this.timeout);
		});
	}

	sendMessage(message, meta) {
		let tellraw = "";
		if (meta != undefined) {
			tellraw = `tellraw @a ["[", {"text":"${meta.author}","color":"${meta.color}"},"] ",{"text":"${message}","color":"white"}]`;
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
