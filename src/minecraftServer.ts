import { IServer } from "./interfaces.js";
import { Message } from "discord.js";
import { MinecraftMessage } from "./lib/messages.js";
import { PacketTooBigError } from "./lib/rcon/packet.js";
import { Rcon } from "./lib/rcon/rcon.js";

export class MinecraftServer {
    channelId: string;
    rcon: Rcon;

    constructor(server: IServer) {
        this.channelId = server.channel_id;
        this.rcon = new Rcon(server);
    }

    connect(): void {
        this.rcon.connect();
    }

    async sendMessage(message: Message): Promise<void> {
        // TODO: Handle errors in send
        const minecraftMsg = MinecraftMessage.format(message);
        try {
            await this.rcon.send(`tellraw @a ${minecraftMsg}`);
        } catch (e) {
            if (e instanceof PacketTooBigError) {
                console.error("Input too big to send to Minecraft. Skipping...");
            } else {
                console.error("Unknown error while sending message to Minecraft: " + e);
            }
        }
    }
}
