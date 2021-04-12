import { AllowNull, Column, Default, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Snowflake, SnowflakeUtil } from "discord.js";
import { Optional, STRING } from "sequelize";
import { TicketModel } from "./ticket-model";

export const defaultID = SnowflakeUtil.generate(0);

export interface ApplicantAttributes {
	applicant_id: Snowflake,
	profile_picture: string,
	name: string,
	discriminator: string
}

@Table({ underscored: true })
export class ApplicantModel
	extends Model<ApplicantAttributes, Optional<ApplicantAttributes, "applicant_id">>
	implements ApplicantAttributes
{
	@Default(defaultID)
	@PrimaryKey
	@Column(STRING)
	applicant_id!: Snowflake;

	@Column
	profile_picture!: string;

	@Column
	discriminator!: string;

	@Column
	name!: string;

	@HasMany(() => TicketModel)
	tickets!: TicketModel[];
}
