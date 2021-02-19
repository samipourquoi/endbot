import { command, discord } from "../dispatcher";
import { Command } from "@samipourquoi/commander";
import { config } from "../../index";

@command(discord)
class TicketCommand
	extends Command {

	constructor() {
		super();

		if (!config.application_system) return;

		this.register.with.literal("ticket")
			.with.literal("yes", "accept")
			.or.literal("no", "decline")
			.or.literal("bruh")
			.or.literal("vote")
	}
}
