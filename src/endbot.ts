import { Client, GatewayIntentBits, Message } from "discord.js";
import { Config } from "./config.js";
import { MinecraftServer } from "./minecraftServer.js";

export class Endbot extends Client {
    config: Config;
    minecraftServers: MinecraftServer[] = [];

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.config = new Config();
        // TODO: Handle failed logins better
        this.login(this.config.token).catch(console.error);

        this.on("messageCreate", this.handleDiscordMessage);
        this.once("ready", async () => {
            console.log("ready");
            this.initMinecraftServers();
        });
    }

    private initMinecraftServers(): void {
        for (const serverConfig of this.config.servers) {
            const server = new MinecraftServer(serverConfig);
            server.connect();
            this.minecraftServers.push(server);
        }
    }

    private handleDiscordMessage(message: Message): void {
        if (message.author.bot) return;

        this.sendMessageToMinecraft(message);
        console.log(message.content);
    }

    private sendMessageToMinecraft(message: Message): void {
        for (const server of this.minecraftServers) {
            if (server.channelId === message.channelId) {
                server.sendMessage(message);
            }
        }
    }
}
