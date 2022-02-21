import { IPacket, IServer } from "../../interfaces";
import { Packet, PacketType } from "./packet";
import { Buffer } from "buffer";
import net from "net";

export class Rcon {
	private socket!: net.Socket;
	private server!: IServer;
	private timeout = 2000;

	constructor(server: IServer) {
		this.server = server;
		this.connect();

		this.socket.once("connect", () => this.auth());
		this.socket.once("end", () => this.end());
		// TODO: Add better handling of errors. I'm not quite sure what some errors are yet
		this.socket.on("error", (error: Error) => console.log(error));
	}

	async connect(): Promise<void> {
		this.socket = net.connect(this.server.rcon_port!, this.server.host);
	}

	async auth(): Promise<void> {
		this.send(this.server.rcon_password, PacketType.AUTH);
	}

	async send(data: string, type = PacketType.COMMAND): Promise<string> {
		const packet = await Packet.create(data, type);
		this.socket.write(packet);

		return new Promise((resolve, reject) => {
			this.socket.once("data", async (data: Buffer) => {
				let packet = await Packet.read(data);

				// If the data received is large, there is a possibility that the response could be multiple packets
				if (packet.size >= 3500) {
					packet = await this.listenForMultiplePackets(data);
				}

				this.socket.removeAllListeners("data");
				resolve(packet.body);
			});

			setTimeout(() => {
				this.socket.removeAllListeners("data");
				reject(new Error(`Timeout exceeded on ${this.server.name}`));
			}, this.timeout);
		});
	}

	private async listenForMultiplePackets(data: Buffer): Promise<IPacket> {
		const packets = [data];

		// An empty packet is sent. When the response to this packet is received, we know the server has
		// sent the full response to the original command. However, we need to wait before sending the empty packet
		// because TCP might combine the last two packets and we wouldn't be able to detect the last packet easily
		setTimeout(async () => {
			const emptyPacket = await Packet.create("", PacketType.COMMAND, 0);
			this.socket.write(emptyPacket);
		}, 100);

		return new Promise((resolve) => {
			this.socket.on("data", async (data: Buffer) => {
				let packet = await Packet.read(data);

				if (packet.id === 0) {
					// The empty packet's response has been received, so we are done. Now, we combine all the packets into one and return it
					data = Buffer.concat(packets);
					packet = await Packet.read(data);
					resolve(packet);
				}

				packets.push(data);
			});
		});
	}

	private async end(): Promise<void> {
		console.log(`Disconnected from: '${this.server.name}'`);
	}
}
