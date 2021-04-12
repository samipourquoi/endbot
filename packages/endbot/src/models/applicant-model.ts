import { AllowNull, Column, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Snowflake } from "discord.js";
import { STRING } from "sequelize";
import { TicketModel } from "./ticket-model";

export interface ApplicantAttributes {
	applicant_id: Snowflake | null,
	profile_picture: string,
	name: string,
	discriminator: string
}

@Table
export class ApplicantModel
	extends Model<ApplicantAttributes>
	implements ApplicantAttributes
{
	@PrimaryKey
	@AllowNull
	@Column(STRING)
	applicant_id!: string | null;

	@Column
	profile_picture!: string;

	@Column
	discriminator!: string;

	@Column
	name!: string;

	@HasMany(() => TicketModel)
	tickets!: TicketModel[];
}
