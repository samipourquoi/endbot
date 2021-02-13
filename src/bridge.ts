import { Rcon } from "rcon-client";
import { Config } from "./config";
import { Channel, TextChannel } from "discord.js";
import { ReadStream } from "fs";
import { spawn } from "child_process";

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

		spawn("tail", [ "-n0", "-f", this.config.log_path ])
			.stdout
			.on("data", chunk => {
				const line = chunk.toString();
				this.onMinecraftMessage(line.slice(0, line.length - 1));
			});
	}

	async onMinecraftMessage(line: string) {
		const [, message ] = (/\[[0-9]{2}:[0-9]{2}:[0-9]{2}] \[Server thread\/INFO]: (.+)/g).exec(line) ?? [];
		if (message.startsWith("[") && message.endsWith("]")) return;

		await this.channel.send(message);
	}
}