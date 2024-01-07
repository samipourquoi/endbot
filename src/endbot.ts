import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import { CommandHandler, commandHandler } from "./commands/commandHandler.js";
import { Bridge } from "./bridge.js";
import { Config } from "./config.js";
import { ICommandContext } from "./lib/interfaces.js";

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
        this.handler = commandHandler;
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
        if (this.isInvalidMessage(message) || this.bridges.length === 0) return;

        this.sendMessageToMinecraft(message);

        const cmdContext = this.createCmdContext(message);
        if (cmdContext.cmdName) {
            await this.handler.handleCommand(cmdContext);
        }
    }

    private isInvalidMessage(message: Message): boolean {
        return message.author.bot || !message.member || !(message.channel instanceof TextChannel);
    }

    private sendMessageToMinecraft(message: Message): void {
        for (const bridge of this.bridges) {
            if (bridge.channel.id === message.channelId) {
                bridge.sendToMinecraft(message);
            }
        }
    }

    private createCmdContext(message: Message): ICommandContext {
        let cmdName = "";
        let args: string[] = [];
        if (this.config.prefixes.includes(message.content[0])) {
            // This message is a valid command
            const words = message.content.split(" ");
            cmdName = words[0].slice(1);
            args = words.slice(1);
        }

        return {
            cmdName: cmdName,
            args: args,
            author: message.member!,
            bridges: this.bridges,
            // Will always be a TextChannel as the isInvalidMessage check passed
            channel: message.channel as TextChannel,
        };
    }
}
