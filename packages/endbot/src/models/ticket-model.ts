import { Snowflake } from "discord.js";
import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	Default,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from "sequelize-typescript";
import { INTEGER, Optional, STRING } from "sequelize";
import { ApplicantModel } from "./applicant-model";

export enum TicketStatus {
	PENDING,
	ACCEPTED,
	DECLINED,
	BRUH
}

export interface TicketAttributes {
	status: TicketStatus,
	round: number,
	channel_id: Snowflake,
	applicant_id: Snowflake | null
}

@Table
export class TicketModel
	extends Model<TicketAttributes, Optional<TicketAttributes, "status" | "round">>
	implements TicketAttributes
{
	@Default(TicketStatus.PENDING)
	@Column(INTEGER)
	status!: TicketStatus;

	@PrimaryKey
	@AutoIncrement
	@Column
	round!: number;

	@ForeignKey(() => ApplicantModel)
	@Column
	channel_id!: string;

	@PrimaryKey
	@AllowNull
	@Column(STRING)
	applicant_id!: Snowflake;

	@BelongsTo(() => ApplicantModel)
	applicant!: ApplicantModel;
}
