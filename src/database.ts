import { INTEGER, ModelDefined, NUMBER, Optional, Sequelize, STRING, TEXT } from "sequelize";
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
		c.db,
		c.user,
		c.password,
		{
			host: c.host,
			dialect: "mysql",
			logging: false
		}
	);

	export const Links: ModelDefined<
		Schemas.LinkAttributes,
		Schemas.LinkAttributes
	> = sequelize.define("links", {
		emote: STRING,
		invite: STRING,
		registry: STRING,
		server_name: STRING
	});

	export const Applicants: ModelDefined<
		Schemas.ApplicantAttributes,
		Schemas.ApplicantAttributes
	> = sequelize.define("applicants", {
		applicant_id: {
			type: STRING,
			primaryKey: true
		},
		discriminator: STRING(4),
		profile_picture: STRING,
		rounds: INTEGER
	});

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
			defaultValue: 0,
			primaryKey: true
		},
		applicant_id: {
			type: STRING,
			primaryKey: true
		},
		channel_id: STRING,
		raw_messages: new TEXT("medium"),
	});

	export async function init() {
		await Promise.all([
			Links,
			Applicants,
			Tickets
		].map(table => table.sync({
			alter: false
		})));
	}
}

export module Schemas {
	export interface LinkAttributes {
		emote: string,
		invite: string,
		registry: string,
		server_name: string
	}

	export interface ApplicantAttributes {
		applicant_id: Snowflake,
		discriminator: string,
		profile_picture: string,
		rounds: number
	}

	export interface TicketAttributes {
		status: TicketStatus,
		round: number,
		channel_id: Snowflake,
		applicant_id: Snowflake,
		raw_messages: string
	}
}
