import { Client, GatewayIntentBits, Message } from "discord.js";
import { IConfig } from "./interfaces.js";

export class Endbot extends Client {
    config: IConfig;

    constructor(config: IConfig) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.config = config;
        this.login(config.token).catch(console.error);

        this.on("messageCreate", this.handleMessage);
        this.once("ready", async () => {
            console.log("ready");
        });
    }

    handleMessage(message: Message): void {
        if (message.author.bot) return;

        console.log(message.content);
    }
}
