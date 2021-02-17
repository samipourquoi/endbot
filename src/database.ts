import { Sequelize, STRING, TEXT } from "sequelize";
import { config } from "./index";
import { Config } from "./config";

export module Database {
	const defaultDatabaseConfig: Config.Database = {
		user: "endbot",
		host: "db",
		password: "supersecret",
		db: "enddb",
		port: 3306
	};
	const { database: c = defaultDatabaseConfig } = config;

	export const sequelize = new Sequelize(
		c.db,
		c.user,
		c.password,
		{
			host: c.host,
			dialect: "mysql",
			logging: false
		}
	);

	export const Links = sequelize.define("links", {
		emote: STRING,
		invite: STRING,
		registry: STRING,
		server_name: STRING
	});

	export async function init() {
		await Promise.all([
			Links.sync()
		]);
	}
}