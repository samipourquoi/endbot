import { Command } from "@samipourquoi/commander";
import { DiscordContext } from "./index";

export class HelpCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("help").run(discordHelp);
	}
}

async function discordHelp(ctx: DiscordContext) {
	await ctx.message.channel.send("no help defined");
}
