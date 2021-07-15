import { Config } from "../config";
import { config } from "../index";
import { Sequelize } from "sequelize-typescript";
import { ArchiveChannelModel } from "./archive-channel-model";
import { LinkModel } from "./link-model";
import { TicketModel } from "./ticket-model";
import { ApplicantModel, defaultID } from "./applicant-model";
import { ModelOptions } from "sequelize";

export const defaultModelOptions: ModelOptions = {
	underscored: true
}

const defaultDatabaseConfig: Config.Database = {
	user: "endbot",
	host: "localhost",
	password: "supersecret",
	db: "enddb",
	port: 3306
};
const { database: c = defaultDatabaseConfig } = config;

export const sequelize = new Sequelize(
	c.db 		|| defaultDatabaseConfig.db,
	c.user 	|| defaultDatabaseConfig.user,
	c.password || defaultDatabaseConfig.password,
	{
		host: c.host 	|| defaultDatabaseConfig.host,
		dialect: "mysql",
		logging: false,
		models: [
			ApplicantModel,
			ArchiveChannelModel,
			LinkModel,
			TicketModel
		]
	},
);

export async function sync() {
	await sequelize.sync({ alter: true });
	await ApplicantModel.findOrCreate({
		where: { applicant_id: defaultID },
		defaults: {
			applicant_id: defaultID,
			discriminator: "0001",
			name: "Unknown",
			// Blue default profile picture
			profile_picture: "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"
		}
	})
}
