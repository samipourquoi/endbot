import { MAX_PACKET_SIZE, Packet, PacketTooBigError } from "../../src/lib/rcon/packet.js";
import { IPacket } from "../../src/interfaces.js";

describe("Packet class", () => {
    const data = "test";
    const id = 10;
    const type = 20;

    it("creates a packet with the correct values", async () => {
        const packet = await Packet.create(data, type, id);
        const size = packet.readInt32LE(0);
        const newId = packet.readInt32LE(4);
        const newType = packet.readInt32LE(8);
        const newData = packet.toString("utf-8", 12, packet.length - 2);

        expect(packet.length).toBe(18);
        expect(size).toBe(14);
        expect(newId).toBe(id);
        expect(newType).toBe(type);
        expect(newData).toBe(data);
    });

    it("reads a packet correctly", async () => {
        const size = Buffer.byteLength(data);
        const packet = Buffer.alloc(size + 14);

        packet.writeInt32LE(size + 10, 0);
        packet.writeInt32LE(id, 4);
        packet.writeInt32LE(type, 8);
        packet.write(data, 12);

        const expectedPacket: IPacket = {
            size: size + 10,
            id: id,
            type: type,
            body: data,
        };

        const decodedPacket = await Packet.read(packet);

        expect(decodedPacket).toStrictEqual(expectedPacket);
    });

    it("raises an error when packet size exceeds maximum packet length", async () => {
        jest.spyOn(Buffer, "byteLength").mockImplementationOnce(() => {
            return MAX_PACKET_SIZE + 1;
        });
        await expect(Packet.create(data, type, id)).rejects.toThrow(PacketTooBigError);
    });
});
