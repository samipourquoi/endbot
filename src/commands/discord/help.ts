import { Command } from "@samipourquoi/commander";
import { CommandContext } from "../index";

export class HelpCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("help").run(discordHelp);
	}
}

async function discordHelp(ctx: CommandContext) {
	await ctx.message.channel.send("no help defined");
}
