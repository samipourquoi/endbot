import { Rcon } from "rcon-client";
import { Config } from "./config";
import { Channel } from "discord.js";

export const bridges: Bridge[] = [];

export class Bridge {
	public rcon: Rcon | null = null;

	constructor(public config: Config.Server,
				public channel: Channel) {
	}

	async connect() {
		this.rcon = await Rcon.connect({
			host: this.config.host,
			password: this.config.rcon_password,
			port: this.config.rcon_port
		});
		bridges.push(this);
	}
}