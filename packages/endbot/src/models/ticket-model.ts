import { Snowflake, SnowflakeUtil, Util } from "discord.js";
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
import { ApplicantModel, defaultID } from "./applicant-model";
import { config } from "../index";

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
	applicant_id: Snowflake
}

@Table({ underscored: true })
export class TicketModel
	extends Model<TicketAttributes, Optional<TicketAttributes, "status" | "round" | "applicant_id">>
	implements TicketAttributes
{
	@Default(TicketStatus.PENDING)
	@Column(INTEGER)
	status!: TicketStatus;

	@PrimaryKey
	@AutoIncrement
	@Column
	round!: number;

	@Column
	channel_id!: string;

	@ForeignKey(() => ApplicantModel)
	@Default(defaultID)
	@PrimaryKey
	@Column(STRING)
	applicant_id!: string;

	@BelongsTo(() => ApplicantModel)
	applicant!: ApplicantModel;
}
