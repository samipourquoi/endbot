import { Command, UnquotedStringType } from "@samipourquoi/commander";
import { command, minecraft, MinecraftContext } from "../dispatcher";

@command(minecraft)
export class PosCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("pos").run(pos)
      .__.with.arg("player", new UnquotedStringType()).run(pos);
	}
}

async function pos(ctx: MinecraftContext) {
	let player = ctx.args[1];
	if (player == undefined) player = ctx.author

	const onlinePlayers = (await ctx.bridge.rcon.send("list")).split(/[, ]/).slice(10);

	if (!onlinePlayers.includes(player)) {
		await ctx.bridge.error("That player is not online");
		return;
	}

	const x = (await ctx.bridge.rcon.send(`data get entity ${player} Pos[0] 1`)).split(" ")[9];
	const y = (await ctx.bridge.rcon.send(`data get entity ${player} Pos[1] 1`)).split(" ")[9];
	const z = (await ctx.bridge.rcon.send(`data get entity ${player} Pos[2] 1`)).split(" ")[9];
	const dimensionData = (await ctx.bridge.rcon.send(`data get entity ${player} Dimension`)).split(/[:"_]/).slice(-2, -1);
	const dimension = dimensionData[0].charAt(0).toUpperCase() + dimensionData[0].slice(1)

	let position = `${player} is at X:${x} Y:${y} Z:${z} in the ${dimension}`;
	await ctx.bridge.sendColoredMessage(position, "aqua")
	await ctx.bridge.rcon.send(`effect give ${player} minecraft:glowing 30 0 true`);
}
