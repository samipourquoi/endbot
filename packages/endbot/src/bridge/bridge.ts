import { Rcon } from "rcon-client";
import { Config } from "../config";
import { Message, TextChannel, Util } from "discord.js";
import { ColorUtils } from "../utils/colors";
import { EventEmitter } from "events";
import { MinecraftClosure } from "../commands/dispatcher";
import { instance } from "../index";
import { minecraft } from "../commands/dispatcher";
import { TextUtils } from "../utils/text"
const specialMessage = require("../../assets/special_messages.json");

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
			() => console.info(`[${TextUtils.getCurrentTime()}] Connected to server: '${this.config.name}'`)
		);
		this.rcon.on(
			"end",
			() => console.info(`[${TextUtils.getCurrentTime()}] Disconnected from: '${this.config.name}'`)
		);
		try {
				await this.rcon.connect();
		} catch {
				console.info(`[${TextUtils.getCurrentTime()}] Failed to connect to server: '${this.config.name}'`);
		}
	}

	async onMinecraftMessage(line: string) {
		const [, message ] = (/\[[0-9]{2}:[0-9]{2}:[0-9]{2}] \[Server thread\/INFO]: (.+)/g).exec(line) ?? [];
		if (!message) return;

		if (message.includes("Thread RCON Listener started")) {
			await this.rcon.connect();
			return;
		}

		if (message.startsWith("[") && message.endsWith("]")) return;

		if (message.startsWith("Villager") && message.endsWith("'")) return;

		if (message.startsWith("<")) {
			let info = message;

			if (info.includes("@") || info.includes("#")) {
				const members = this.channel.guild.members.cache;
				members.forEach(member => {
					if (info.includes(member.displayName)) {
						info = info.replace("@" + member.displayName, "<@!" + member.id + ">")
					}
				})

				const roles = this.channel.guild!.roles.cache;
				roles.forEach(role => {
					if (info.includes(role.name)) {
						info = info.replace("@" + role.name, "<@&" + role.id + ">")
					}
				})

				const channels = this.channel.guild!.channels.cache;
				channels.forEach(channel => {
					if (info.includes(channel.name)) {
						info = info.replace("#" + channel.name, "<#" + channel.id + ">")
					}
				})
			}

			await this.channel.send(
				Util.escapeMarkdown(info),
				{ disableMentions: "none" })
		} else {
			for (const word of specialMessage) {
				if (message.includes(word)) {
					await this.channel.send(
						Util.escapeMarkdown(message),
						{ disableMentions: "none" })
					break;
				}
			}
		};

		const { prefix } = instance;
		const words = message.split(" ");
		const author = words[0]?.slice(1, words[0]?.length - 1);
		const content = words.slice(1)
			.join(" ");
		if (!content.startsWith(prefix)) return;
		const closure: MinecraftClosure = {
			bridge: this,
			line,
			author,
			content
		};

		try {
			await minecraft.run(content.slice(prefix.length), closure);
		} catch (e) {
			await this.error(` > Unexpected error: ${e}`);
		}
	}

	async onDiscordMessage(message: Message) {
		try {
			let content = message.content;

			if (content.includes("@") || content.includes("#")) {
				const members = message.guild!.members.cache;
				members.forEach(member => {
					if (content.includes(member.id)) {
						content = content.replace("<@!" + member.id + ">", "@" + member.displayName)
					}
				})

				const roles = message.guild!.roles.cache;
				roles.forEach(role => {
					if (content.includes(role.id)) {
						content = content.replace("<@&" + role.id + ">", "@" + role.name)
					}
				})

				const channels = message.guild!.channels.cache;
				channels.forEach(channel => {
					if (content.includes(channel.id)) {
						content = content.replace("<#" + channel.id + ">", "@" + channel.name)
					}
				})
			}
			
			await this.sendMessageToMinecraft(
				message.author.username,
				content,
				ColorUtils.closestMinecraftColor(message.member?.roles.highest.color || 0)
			);
		} catch {
			return;
		}
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

	async sendColoredMessage(message: string, color: string) {
		const json = { color, text: message };
		await this.rcon.send(`tellraw @a ${JSON.stringify(json)}`);
	}

	async log(message: string) {
		await this.sendColoredMessage(message, "white");
	}

	async error(message: string) {
		await this.sendColoredMessage(message, "red");
	}

	async succeed(message: string) {
		await this.sendColoredMessage(message, "green");
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

	export function checkOP(ops_only: boolean): Bridge | undefined {
		return instances.find(bridge => bridge.config.ops_only == ops_only);
	}
}
