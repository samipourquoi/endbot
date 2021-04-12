import { Snowflake } from "discord.js";
import { STRING, TEXT } from "sequelize";
import { Column, Model, Table } from "sequelize-typescript";

export interface ArchiveChannelAttributes {
	channel_id: Snowflake,
	raw_messages: string
}

@Table
export class ArchiveChannelModel
	extends Model<ArchiveChannelAttributes>
	implements ArchiveChannelAttributes
{
	@Column(STRING)
	channel_id!: Snowflake;

	@Column(new TEXT("medium"))
	raw_messages!: string;
}
