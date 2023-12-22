import { IServer } from "./interfaces.js";
import { Message } from "discord.js";
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
        await this.rcon.send(`tellraw @a {"text": "${message.content}"}`);
    }
}
