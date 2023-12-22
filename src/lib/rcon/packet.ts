import { Buffer } from "buffer";
import { IPacket } from "../../interfaces.js";

export const PacketType = {
    AUTH: 3,
    COMMAND: 2,
    RESPONSE: 0,
};

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

        packet.writeInt32LE(size + 10, 0); // Size of the packet
        packet.writeInt32LE(id, 4); // ID of the packet
        packet.writeInt32LE(type, 8); // Packet type being sent
        packet.write(data, 12); // The rest of the packet is for the data being sent
        // The packet doesn't need to end with an empty string as Minecraft doesn't care about that

        return packet;
    }
}
