import { Channel, Collection, Message, SnowflakeUtil, TextChannel } from "discord.js";
import { config, instance } from "../index";
import { Database } from "../database";

const notConfiguredErrorMessage = "trying to create a ticket but the application system isn't configured.";

export interface Archivable {
	archive(): Promise<void>;
}

export module Archive {
	export async function getMessageHistory(channel: TextChannel): Promise<Message[]> {
		const BATCH_SIZE = 50;
		let history: Message[] = [];
		let batch: Collection<string, Message>;
		let lastMessageID = channel.lastMessageID;

		// Fetches batches of messages in a channel, until
		// it reaches the first message posted in it.
		do {
			batch = await channel.messages.fetch({
				limit: BATCH_SIZE,
				before: lastMessageID || SnowflakeUtil.generate(Date.now())
			}, false);

			if (batch.size == 0) break;
			lastMessageID = batch.last()!.id;

			history = [ ...batch.array(), ...history ];
		} while (batch.size == BATCH_SIZE);

		return history.reverse();
	}
}

export class Ticket
	implements Archivable {

	private constructor(public channel: TextChannel) {
	}

	static async generate(username: string): Promise<Ticket> {
		if (!config.application_system) throw new Error(notConfiguredErrorMessage);

		const guild = await instance.guilds.resolve(config.application_system.guild_id)!;
		const channel = await guild.channels.create(`${username}-ticket`, {
			parent: config.application_system.category_id
		}) as TextChannel;
		const ticket = new Ticket(channel);

		await Database.Tickets.create({
			channel_id: channel.id,
			applicant_id: "",
			raw_messages: "[]"
		});

		return ticket;
	}

	static async from(channel: TextChannel): Promise<Ticket | null> {
		const ticket = await Database.Tickets.findOne({
			where: {
				channel_id: channel.id
			}
		});
		if (!ticket) return null;
		return new Ticket(channel);
	}

	async archive(): Promise<void> {
		const history = await Archive.getMessageHistory(this.channel);
		const encoded = JSON.stringify(history.map(message => message.toJSON()));
	}
}

export enum TicketStatus {
	PENDING,
	ACCEPTED,
	DECLINED,
	BRUH
}
