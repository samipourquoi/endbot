import { command, discord, DiscordContext } from "../dispatcher";
import { Command } from "@samipourquoi/commander";
import { config, instance } from "../../index";
import { Ticket } from "../../structures/archive";
import { MessageEmbed, TextChannel } from "discord.js";
import { TicketStatus } from "../../models/ticket-model";
import { Embed } from "../../utils/embeds";

@command(discord)
class TicketCommand
	extends Command {

	constructor() {
		super();

		if (!config.application_system) return;

		this.register.with.literal("ticket")
			.with.literal("yes", "accept").run(close(TicketStatus.ACCEPTED))
			.or.literal("no", "decline").run(close(TicketStatus.DECLINED))
			.or.literal("bruh").run(close(TicketStatus.BRUH))
			.or.literal("vote").run(vote);
	}
}

function close(status: TicketStatus) {
	return async (ctx: DiscordContext) => {
		const ticket = await Ticket.from(ctx.message.channel as TextChannel);
		if (ticket == null) {
			await ctx.message.channel.send(Embed.error("", "This channel isn't a ticket." ));
			return;
		}

		await ticket.archive(status);
		await ctx.message.channel.delete();
	}
}

async function vote(ctx: DiscordContext) {
	if (!config.application_system) return;

	const ticket = await Ticket.from(ctx.message.channel as TextChannel);
	if (!ticket) throw "this channel isn't a ticket";

	await ticket.vote();
}
