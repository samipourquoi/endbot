import { DiscordMessage, MinecraftMessage } from "./lib/messages.js";
import { Message, TextChannel } from "discord.js";
import { IServer } from "./lib/interfaces.js";
import { PacketTooBigError } from "./lib/rcon/packet.js";
import { Rcon } from "./lib/rcon/rcon.js";
import { Tail } from "tail";
import { existsSync } from "fs";

export class Bridge {
    channel: TextChannel;
    name: string;

    private rcon: Rcon;
    private serverLogPath: string;

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
            this.sendToDiscord(line);
        });

        tail.on("error", (error: any) => {
            console.log(`Error while tailing log file (${this.serverLogPath}): ${error}`);
        });
    }

    async sendToDiscord(line: string): Promise<void> {
        const message = await DiscordMessage.filter(line, this.channel);
        if (!message) return; // Message does not match what we want to send to Discord

        this.channel.send({ content: message, allowedMentions: { parse: ["users", "roles"] } });
    }

    async sendToMinecraft(message: Message): Promise<void> {
        const minecraftMsg = MinecraftMessage.format(message);
        await this.sendMinecraftCommand(`tellraw @a ${minecraftMsg}`);
    }

    async sendMinecraftCommand(command: string): Promise<string> {
        try {
            // TODO: Handle errors in send
            return await this.rcon.send(command);
        } catch (e) {
            if (e instanceof PacketTooBigError) {
                console.error("Input too big to send to Minecraft. Skipping...");
            } else {
                console.error("Unknown error while sending command to Minecraft: " + e);
            }
        }

        return "";
    }
}
