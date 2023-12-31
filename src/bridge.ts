import { Message, TextChannel } from "discord.js";
import { IServer } from "./interfaces.js";
import { MinecraftMessage } from "./lib/messages.js";
import { PacketTooBigError } from "./lib/rcon/packet.js";
import { Rcon } from "./lib/rcon/rcon.js";
import { Tail } from "tail";
import { existsSync } from "fs";

export class Bridge {
    channel: TextChannel;
    name: string;
    rcon: Rcon;
    serverLogPath: string;

    constructor(server: IServer, channel: TextChannel) {
        this.channel = channel;
        this.name = server.name;
        this.rcon = new Rcon(server);
        this.serverLogPath = `${server.folder_path}/logs/latest.log`;
    }

    connect(): void {
        this.rcon.connect();
        this.initTail();
    }

    private initTail(): void {
        if (!existsSync(this.serverLogPath)) {
            console.error(`Error: ${this.name}'s log file does not exist at ${this.serverLogPath}`);
            return;
        }

        const tail = new Tail(this.serverLogPath);
        tail.on("line", (line: string) => {
            this.channel.send(line);
        });

        tail.on("error", (error: any) => {
            console.log(`Error while tailing log file (${this.serverLogPath}): ${error}`);
        });
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
