import * as YAML from "yaml";
import { existsSync, readFileSync, writeFileSync } from "fs";

export module Config {
	export interface Config {
		token: string,

		servers: Server[]
	}

	export interface Server {
		name: string,
		host: string,
		rcon_port: number,
		rcon_password: string,
		bridge_channel: string,
		ops_only?: boolean,
		log_path: string
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
				log_path: "path/to/latest.log"
			}
		]
	}

	export function init(): Config {
		if (existsSync("config.yml") ||
			existsSync("config.yaml")) {

			const content = readFileSync("config.yml", "utf-8") ??
				readFileSync("config.yaml", "utf-8") ??
				"";
			return YAML.parse(content);
		} else {
			writeFileSync("config.yml", YAML.stringify(defaultConfig));
			console.info(
				"Wrote default config to config.yml. Please fill it out, more info at:\n" +
				" > https://github.com/samipourquoi/endbot"
			);
			process.exit(1);
			return defaultConfig;
		}
	}
}