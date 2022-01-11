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
		local_folder_path: string,
		backup_folder_path: string,
		auto_backups: string,
		backup_interval: string,
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
		webhook_port: 34345,
		op_role: "<role.id>",
		servers: [
			{
				name: "Server",
				is_local: true,
				local_folder_path: "path/to/server_folder # Only fill out if is_local is true",
				backup_folder_path: "path/to/backup_folder # Only fill out if is_local is true. This path also has to be local",
				auto_backups: "false # Only works if server is local. Backups a server every 24 hours(can be changed below)",
				backup_interval: "24 # Time in hours. Only needed if auto_backups is true",
				host: "host.docker.internal # Use 'localhost' if you're not using docker",
				rcon_port: 25575,
				rcon_password: "supersecret",
				bridge_channel: "<CHANNEL ID>",
				ops_only: true,
			}
		]
	}

	export function init(): Config {
		/*
		This isn't a very robust way of deciding the config directory
		I'm trying to detect if the program is run in a yarn workspace or not
		Let me know if there is a safer/better way of doing this
		*/

		const configDir = process.env.npm_package_scripts_start?.includes("./docker/start") ?
			"config" :
			"../../config";

		let content;
		if (existsSync(`${configDir}/config.yml`)) {
			content = readFileSync(`${configDir}/config.yml`, "utf-8");
			return YAML.parse(content);
		}
		else if (existsSync(`${configDir}/config.yaml`)) {
			content = readFileSync(`${configDir}/config.yaml`, "utf-8")
			return YAML.parse(content);
		}
		else {
			if (!existsSync(configDir)) {
				mkdirSync("../../config");
			}
			writeFileSync(`${configDir}/config.yml`, YAML.stringify(defaultConfig));
			console.info(
				"Wrote default config to 'config/config.yml'. Please fill it out, more info at:\n" +
				" > https://github.com/samipourquoi/endbot"
			);
			process.exit();
		}
	}
}
