import * as YAML from "yaml";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Snowflake } from "discord.js";

export module Config {
	export interface Config {
		token: string,
		client_secret: string,
		op_role: string,
		servers: Server[]
		webhook_port?: number
		database?: Database
		discord_links?: {
			emote_server_id: string
		},
		application_system?: ApplicationSystem,
		web?: WebConfig
	}

	export interface Server {
		name: string,
		is_local: boolean,
		local_log_file_path: string,
		host: string,
		rcon_port: number,
		rcon_password: string,
		bridge_channel: string,
		ops_only?: boolean
	}

	export interface Database {
		user: string,
		password: string,
		host: string,
		db: string,
		port?: number
	}

	export interface ApplicationSystem {
		guild_id: Snowflake,
		category_id: Snowflake,
		voting_channel: Snowflake,
		yes: string,
		no: string
	}

	export interface WebConfig {
		port: number,
		redirect_uri: string,
		member_role_id: string
	}

	const defaultConfig: Config = {
		token: "<YOUR TOKEN HERE>",
		client_secret: "<CLIENT SECRET>",
		op_role: "<role.id>",
		servers: [
			{
				name: "Server",
				is_local: true,
				local_log_file_path: "path/to/logs/latest.log # Only fill out if is_local is true",
				host: "host.docker.internal # Use 'localhost' if you're not using docker",
				rcon_port: 25575,
				rcon_password: "supersecret",
				bridge_channel: "<CHANNEL ID>",
				ops_only: true,
			}
		],
		webhook_port: 34345
	}

	export function init(): Config {
		const configDir = process.env.ENV == "production" ?
			"/etc/endbot/config" :
			"../../config";

		if (existsSync(`${configDir}/config.yml`) ||
			existsSync(`${configDir}/config.yaml`)) {

			const content = readFileSync(`${configDir}/config.yml`, "utf-8") ??
				readFileSync(`${configDir}/config.yml`, "utf-8") ??
				"";
			return YAML.parse(content);
		} else {
			mkdirSync("../../config");
			writeFileSync(`${configDir}/config.yml`, YAML.stringify(defaultConfig));
			console.info(
				"Wrote default config to 'config/config.yml'. Please fill it out, more info at:\n" +
				" > https://github.com/samipourquoi/endbot"
			);
			return defaultConfig
		}
	}
}
