import { Command } from "@samipourquoi/commander";
import { MinecraftContext } from "./index";

export class HelpCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("help").run(help)
	}
}

async function help(ctx: MinecraftContext) {
	await ctx.bridge.log("no help defined");
}
