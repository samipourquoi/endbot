import { IServer } from "./interfaces.js";
import { Message } from "discord.js";
import { MinecraftMessage } from "./lib/messages.js";
import { PacketTooBigError } from "./lib/rcon/packet.js";
import { Rcon } from "./lib/rcon/rcon.js";

export class Bridge {
    channelId: string;
    rcon: Rcon;

    constructor(serverConfig: IServer) {
        this.channelId = serverConfig.channel_id;
        this.rcon = new Rcon(serverConfig);
    }

    connect(): void {
        this.rcon.connect();
    }

    async sendToMinecraft(message: Message): Promise<void> {
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
