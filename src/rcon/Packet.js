"use strict";

class Packet {
	constructor(id, type, body) {
		let size = Buffer.byteLength(body) + 14;

		this.size = size;
		this.id = id;
		this.type = type;
		this.buffer = Buffer.alloc(size);

		this.buffer.writeInt32LE(size - 4, 0);
		this.buffer.writeInt32LE(id, 4);
		this.buffer.writeInt32LE(type, 8);
		this.buffer.write(body, 12, size - 2, "ascii");
		this.buffer.writeInt16LE(0, size - 2);
	}

	static read(data) {
		return {
			size: 	data.readInt32LE(0),
			id: 	data.readInt32LE(4),
			type: 	data.readInt32LE(8),
			body: 	data.toString("ascii", 12, data.length - 2)
		};
	}
}

module.exports = Packet;
