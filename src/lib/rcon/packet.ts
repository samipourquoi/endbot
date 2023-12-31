import { Buffer } from "buffer";
import { IPacket } from "../../interfaces.js";

export const PacketType = {
    AUTH: 3,
    COMMAND: 2,
    RESPONSE: 0,
};

// This is the max size a client to server RCON packet can be. If this is exceeded, the
// connection will terminate. Source: https://mctools.readthedocs.io/en/master/rcon.html
export const MAX_PACKET_SIZE = 1446;

export class PacketTooBigError extends Error {
    constructor() {
        super("Packet size exceeded max packet size allowed for RCON");
    }
}

export class Packet {
    static async read(packet: Buffer): Promise<IPacket> {
        const size = packet.readInt32LE(0);
        const id = packet.readInt32LE(4);
        const type = packet.readInt32LE(8);
        const body = packet.toString("utf-8", 12, packet.length - 2);

        return { size, id, type, body };
    }

    static async create(data: string, type: number, id = 1): Promise<Buffer> {
        const size = Buffer.byteLength(data);
        const packet = Buffer.alloc(size + 14);

        // Make sure the input is not too big, which will terminate the connection
        if (size > MAX_PACKET_SIZE) throw new PacketTooBigError();

        packet.writeInt32LE(size + 10, 0); // Size of the packet
        packet.writeInt32LE(id, 4); // ID of the packet
        packet.writeInt32LE(type, 8); // Packet type being sent
        packet.write(data, 12); // The rest of the packet is for the data being sent
        // The packet doesn't need to end with an empty string as Minecraft doesn't care about that

        return packet;
    }
}
