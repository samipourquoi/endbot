import { Column, Model, Table } from "sequelize-typescript";

export interface LinkAttributes {
	emote: string,
	invite: string,
	registry: string,
	server_name: string
}

@Table({ underscored: true })
export class LinkModel
	extends Model<LinkAttributes>
	implements LinkAttributes
{
	@Column
	emote!: string;

	@Column
	invite!: string;

	@Column
	registry!: string;

	@Column
	server_name!: string;
}
