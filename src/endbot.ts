import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import { Bridge } from "./bridge.js";
import { CommandHandler } from "./commands/commandHandler.js";
import { Config } from "./config.js";

export class Endbot extends Client {
    private bridges: Bridge[] = [];
    private config: Config;
    private handler: CommandHandler;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.config = new Config();
        this.handler = new CommandHandler();
        // TODO: Handle failed logins better
        this.login(this.config.token).catch(console.error);

        this.on("messageCreate", this.handleDiscordMessage);
        this.once("ready", () => {
            console.log("ready");
            this.initBridges();
        });
    }

    private initBridges(): void {
        for (const serverConfig of this.config.servers) {
            const channel = this.channels.cache.get(serverConfig.channel_id);
            if (channel === undefined || !(channel instanceof TextChannel)) {
                // TODO: Handle better
                console.log(
                    "Discord channel doesn't exist or is not a text channel for " +
                        serverConfig.name,
                );
                continue;
            }
            const bridge = new Bridge(serverConfig, channel);
            bridge.connect();
            this.bridges.push(bridge);
        }
    }

    private async handleDiscordMessage(message: Message): Promise<void> {
        if (message.author.bot) return;

        this.sendMessageToMinecraft(message);

        const { cmdName, args } = this.extractCommand(message.content);
        if (cmdName) {
            const resultEmbed = await this.handler.runCommand(cmdName, args, message.member!);
            message.channel.send({ embeds: [resultEmbed] });
        }
    }

    private sendMessageToMinecraft(message: Message): void {
        for (const bridge of this.bridges) {
            if (bridge.channel.id === message.channelId) {
                bridge.sendToMinecraft(message);
            }
        }
    }

    private extractCommand(content: string): { cmdName: string; args: string[] } {
        if (!this.config.prefixes.includes(content[0])) {
            return { cmdName: "", args: [] };
        }

        const words = content.split(" ");
        return { cmdName: words[0].slice(1), args: words.slice(1) };
    }
}
