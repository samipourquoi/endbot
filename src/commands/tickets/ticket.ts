import { command, discord, DiscordContext } from "../dispatcher";
import { Command } from "@samipourquoi/commander";
import { config } from "../../index";
import { Ticket, TicketStatus } from "../../structures/archive";
import { MessageEmbed, TextChannel } from "discord.js";
import { Colors } from "../../utils/theme";

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
			.or.literal("vote")
	}
}

function close(status: TicketStatus) {
	return async (ctx: DiscordContext) => {
		const ticket = await Ticket.from(ctx.message.channel as TextChannel);
		if (ticket == null) {
			const error = new MessageEmbed()
				.setColor(Colors.ERROR)
				.setDescription("This channel isn't a ticket.");
			await ctx.message.channel.send(error);
			return;
		}

		await ticket.archive(status);
		await ctx.message.channel.delete();
	}
}
