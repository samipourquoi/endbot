import { Sequelize, STRING, TEXT } from "sequelize";

export module Database {
	export const sequelize = new Sequelize(
		"enddb",
		"endbot",
		"supersecret",
		{
			host: "localhost",
			dialect: "mysql",
			logging: false
		}
	);

	export const Presets = sequelize.define("presets", {
		owner: STRING,
		name: STRING,
		objectives: TEXT
	});

	async function init() {
		await Promise.all([
			Presets.sync()
		]);
	}
}