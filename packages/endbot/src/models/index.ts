import { Config } from "../config";
import { config } from "../index";
import { Sequelize } from "sequelize-typescript";
import { ArchiveChannelModel } from "./archive-channel-model";
import { LinkModel } from "./link-model";
import { TicketModel } from "./ticket-model";
import { ApplicantModel } from "./applicant-model";

const defaultDatabaseConfig: Config.Database = {
	user: "endbot",
	host: "db",
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
		],
		sync: {

		}
	},
);

export function sync() {
	return sequelize.sync({ alter: true });
}
