import { Sequelize, STRING, TEXT } from "sequelize";
import { config } from "./index";

export module Database {
	const { database: c } = config;

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