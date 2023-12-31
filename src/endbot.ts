import { Client, GatewayIntentBits, Message } from "discord.js";
import { Bridge } from "./bridge.js";
import { Config } from "./config.js";

export class Endbot extends Client {
    config: Config;
    bridges: Bridge[] = [];

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
            this.initBridges();
        });
    }

    private initBridges(): void {
        for (const serverConfig of this.config.servers) {
            const bridge = new Bridge(serverConfig);
            bridge.connect();
            this.bridges.push(bridge);
        }
    }

    private handleDiscordMessage(message: Message): void {
        if (message.author.bot) return;

        this.sendMessageToMinecraft(message);
        console.log(message.content);
    }

    private sendMessageToMinecraft(message: Message): void {
        for (const bridge of this.bridges) {
            if (bridge.channelId === message.channelId) {
                bridge.sendToMinecraft(message);
            }
        }
    }
}
