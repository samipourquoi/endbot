import { Command } from "@samipourquoi/commander";
import { command, discord, DiscordContext } from "../dispatcher";

@command(discord)
class HelpCommand
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
