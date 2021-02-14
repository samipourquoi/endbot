import { Rcon } from "rcon-client";
import { Config } from "./config";
import { Channel, Message, TextChannel, Util } from "discord.js";
import { ReadStream } from "fs";
import { spawn } from "child_process";
import { ColorUtils } from "./utils/colors";

export const bridges: Bridge[] = [];

export class Bridge {
	public rcon: Rcon | null = null;

	constructor(public config: Config.Server,
				public channel: TextChannel) {
	}

	async connect() {
		this.rcon = await Rcon.connect({
			host: this.config.host,
			password: this.config.rcon_password,
			port: this.config.rcon_port
		});
		bridges.push(this);
		this.rcon.on(
			"authenticated",
			() => console.info(`Connected to server: '${this.config.name}'`)
		);

		spawn("tail", [ "-n0", "-f", this.config.log_path ])
			.stdout
			.on("data", chunk => {
				const line = chunk.toString();
				this.onMinecraftMessage(line.slice(0, line.length - 1));
			});
	}

	async onMinecraftMessage(line: string) {
		const [, message ] = (/\[[0-9]{2}:[0-9]{2}:[0-9]{2}] \[Server thread\/INFO]: (.+)/g).exec(line) ?? [];
		if (!message) return;
		
		if (message.startsWith("[") && message.endsWith("]")) return;

		await this.channel.send(
			Util.escapeMarkdown(message),
			{ disableMentions: "none" }
		);
	}

	async onDiscordMessage(message: Message) {
		await this.sendMessageToMinecraft(
			message.author.username,
			message.content,
			ColorUtils.closestMinecraftColor(message.member?.roles.highest.color || 0)
		);
	}

	async sendMessageToMinecraft(author: string, message: string, color: string = "white") {
		const json = [
			"[",
			{ text: author, color },
			"] ",
			message
		];

		await this.rcon?.send(`tellraw @a ${JSON.stringify(json)}`);
	}
}

export module Bridges {
	export function getFromMessage(message: Message) {
		return bridges.find(bridge => bridge.channel.id == message.channel.id);
	}

	export function formatDiscordMessage(message: Message) {
		return `[${message.author.username}] ${message.content}`;
	}
}