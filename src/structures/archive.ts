import {
	Channel,
	Collection,
	EmbedField,
	EmbedFieldData,
	Message,
	MessageEmbed,
	SnowflakeUtil,
	TextChannel
} from "discord.js";
import { config, instance } from "../index";
import { Database } from "../database";
import { Colors } from "../utils/theme";

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

	static async generate(answers: { [k: string]: string }): Promise<Ticket> {
		if (!config.application_system) throw new Error();

		const guild = await instance.guilds.resolve(config.application_system.guild_id)!;

		const tag = answers["What is your Discord Tag?"];
		const [, username ] = /(.+)#[0-9]{4}/g.exec(tag) ?? [];

		// Fetches the user on the guild
		const members = await guild.members.fetch();
		const member = members.find(member =>
			member.user.tag.toLowerCase() == tag.toLocaleLowerCase());

		// Creates the channel
		const channel: TextChannel = await guild.channels.create(
			`${username}-ticket`,
			{ parent: config.application_system.category_id }
		);
		if (member)
			await channel.createOverwrite(member, { VIEW_CHANNEL: true });
		else {
			const embed = new MessageEmbed()
				.setColor(Colors.ERROR)
				.setDescription(`Couldn't find user ${tag}`);
			await channel.send(embed);
		}

		// Generates the embed (i hate this code)
		const fields: EmbedFieldData[] = [];
		for (const [ question, answer ]
			of Object.entries(answers)) {

			const maxLength = 1000;
			let hasAlreadyPutTitle = false;
			let bitWhichFits = "";
			let bitWhichDoesntFit = answer;
			do {
				bitWhichFits = bitWhichDoesntFit.slice(0, maxLength)
				bitWhichDoesntFit = bitWhichDoesntFit.slice(maxLength);
				fields.push({
					name: !hasAlreadyPutTitle ?
						(hasAlreadyPutTitle = true, question) :
						"\u200B",
					value: bitWhichFits
				});
			} while (bitWhichDoesntFit != "");
		}

		let embed: MessageEmbed | null = new MessageEmbed()
			.setColor(Colors.TRANSPARENT)
			.setAuthor("ENDTECH APPLICATION");
		let currentEmbedCharacterLength = 0;
		for (const field of fields) {
			if (embed == null) {
				embed = new MessageEmbed()
					.setColor(Colors.TRANSPARENT);
			}

			embed.fields.push(field as EmbedField);
			currentEmbedCharacterLength += field.value.length;

			if (currentEmbedCharacterLength >= 5500 ||
				embed.fields.length >= 25) {
				await channel.send(embed);
				embed = null;
			}
		}
		if (embed != null) {
			await channel.send(embed);
		}

		const ticket = new Ticket(channel);

		await Database.Tickets.create({
			channel_id: channel.id,
			applicant_id: member?.user.id || null,
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
