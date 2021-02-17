import * as YAML from "yaml";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Snowflake } from "discord.js";

export module Config {
	export interface Config {
		token: string,
		servers: Server[]
		webhook_port?: number
		database: DatabaseConfig
		discord_links?: {
			emote_server_id: string
		}
	}

	export interface Server {
		name: string,
		host: string,
		rcon_port: number,
		rcon_password: string,
		bridge_channel: string,
		ops_only?: boolean
	}

	export interface DatabaseConfig {
		user: string,
		password: string,
		host: string,
		db: string,
		port?: number
	}

	const defaultConfig: Config = {
		token: "<YOUR TOKEN HERE>",
		servers: [
			{
				name: "Server",
				host: "localhost",
				rcon_port: 25575,
				rcon_password: "supersecret",
				bridge_channel: "<CHANNEL ID>",
				ops_only: true,
			}
		],
		database: {
			user: "endbot",
			password: "supersecret",
			host: "localhost",
			db: "enddb",
			port: 3306
		},
		webhook_port: 34345
	}

	export function init(): Config {
		const configDir = process.env.ENV == "production" ?
			"/etc/endbot/config" :
			"config";

		if (existsSync(`${configDir}/config.yml`) ||
			existsSync(`${configDir}/config.yaml`)) {

			const content = readFileSync(`${configDir}/config.yml`, "utf-8") ??
				readFileSync(`${configDir}/config.yml`, "utf-8") ??
				"";
			return YAML.parse(content);
		} else {
			mkdirSync("config");
			writeFileSync(`${configDir}/config.yml`, YAML.stringify(defaultConfig));
			console.info(
				"Wrote default config to 'config/config.yml'. Please fill it out, more info at:\n" +
				" > https://github.com/samipourquoi/endbot"
			);
			process.exit(1);
			return defaultConfig;
		}
	}
}