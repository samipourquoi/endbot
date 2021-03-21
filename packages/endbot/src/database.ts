import { INTEGER, ModelDefined, ModelOptions, NUMBER, Optional, Sequelize, STRING, TEXT } from "sequelize";
import { config } from "./index";
import { Config } from "./config";
import { TicketStatus } from "./structures/archive";
import { Snowflake, SnowflakeUtil } from "discord.js";

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
		c.db 		|| defaultDatabaseConfig.db,
		c.user 	|| defaultDatabaseConfig.user,
		c.password || defaultDatabaseConfig.password,
		{
			host: c.host 	|| defaultDatabaseConfig.host,
			dialect: "mysql",
			logging: false
		}
	);

	const defaultModelOptions: ModelOptions = {
		underscored: true
	}

	export const Links: ModelDefined<
		Schemas.LinkAttributes,
		Schemas.LinkAttributes
	> = sequelize.define("links", {
		emote: STRING,
		invite: STRING,
		registry: STRING,
		server_name: STRING
	}, defaultModelOptions);

	export const Tickets: ModelDefined<
		Schemas.TicketAttributes,
		Optional<Schemas.TicketAttributes, "status" | "round">
	> = sequelize.define("tickets", {
		status: {
			type: INTEGER,
			defaultValue: TicketStatus.PENDING
		},
		round: {
			type: INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		applicant_id: {
			type: STRING,
			primaryKey: true,
			allowNull: true
		},
		channel_id: STRING
	}, defaultModelOptions);

	export const Applicants: ModelDefined<
		Schemas.ApplicantAttributes,
		Schemas.ApplicantAttributes
	> = sequelize.define("applicants", {
		applicant_id: {
			type: STRING,
			allowNull: true,
			primaryKey: true
		},
		profile_picture: STRING,
		name: STRING,
		discriminator: STRING
	}, defaultModelOptions);

	export const ArchiveChannel: ModelDefined<
		Schemas.ArchiveChannelAttributes,
		Schemas.ArchiveChannelAttributes
	> = sequelize.define("archive_channel", {
		channel_id: {
			type: STRING,
			primaryKey: true
		},
		raw_messages: new TEXT("medium")
	}, defaultModelOptions);

	export async function init() {
		if (config.application_system) {
			Tickets.hasOne(ArchiveChannel, {
				sourceKey: "channel_id",
				foreignKey: "channel_id"
			});
			ArchiveChannel.belongsTo(Tickets, {
				foreignKey: "channel_id",
				targetKey: "channel_id"
			});
		}

		await Promise.all([
			Links,
			ArchiveChannel,
			...(config.application_system ? [Tickets, Applicants] : [])
		].map(table => table.sync({ alter: true })));
	}
}

export module Schemas {
	export interface LinkAttributes {
		emote: string,
		invite: string,
		registry: string,
		server_name: string
	}

	export interface TicketAttributes {
		status: TicketStatus,
		round: number,
		channel_id: Snowflake,
		applicant_id: Snowflake | null
	}

	export interface ApplicantAttributes {
		applicant_id: Snowflake | null,
		profile_picture: string,
		name: string,
		discriminator: string
	}

	export interface ArchiveChannelAttributes {
		channel_id: Snowflake,
		raw_messages: string
	}
}
