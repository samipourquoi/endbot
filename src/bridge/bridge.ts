import { Rcon } from "rcon-client";
import { Config } from "../config";
import { Message, TextChannel, Util } from "discord.js";
import { ColorUtils } from "../utils/colors";
import { EventEmitter } from "events";

export declare interface Bridge {
	emit(event: "minecraft", line: string): boolean;
	emit(event: "discord", message: Message): boolean;
	on(event: "minecraft", handler: (line: string) => void): this;
	on(event: "discord", handler: (message: Message) => void): this;
}

export class Bridge
	extends EventEmitter {

	public rcon: Rcon;

	constructor(public config: Config.Server,
				public channel: TextChannel) {
		super();

		this.rcon = new Rcon({
			host: this.config.host,
			password: this.config.rcon_password,
			port: this.config.rcon_port
		});

		this.on("minecraft", this.onMinecraftMessage);
		this.on("discord", this.onDiscordMessage);
	}

	async connect() {
		Bridges.instances.push(this);
		this.rcon.on(
			"authenticated",
			() => console.info(`Connected to server: '${this.config.name}'`)
		);
		await this.rcon.connect();
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
	export const instances: Bridge[] = [];

	export function getFromMessage(message: Message): Bridge[] {
		return instances.filter(bridge => bridge.channel.id == message.channel.id);
	}

	export function getFromName(name: string): Bridge | undefined {
		return instances.find(bridge => bridge.config.name == name);
	}

	export function formatDiscordMessage(message: Message) {
		return `[${message.author.username}] ${message.content}`;
	}
}