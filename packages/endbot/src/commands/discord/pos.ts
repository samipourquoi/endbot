import { Command, UnquotedStringType } from "@samipourquoi/commander";
import { MessageEmbed } from "discord.js";
import { Bridge, Bridges } from "../../bridge/bridge";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";
import { Embed } from "../../utils/embeds";

@command(discord)
class PosCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("pos").run(online)
            .__.with.arg("player", new UnquotedStringType()).run(online);

    }
}

async function online(ctx: DiscordContext) {

    let bridges = Bridges.getFromMessage(ctx.message);

    if (bridges.length == 0) {
    	await ctx.message.channel.send(Embed.error("You must be in a bridge channel to do that!"));
    	return;
    }

		await pos(bridges[0], ctx)
}

async function pos(bridge: Bridge, ctx: DiscordContext) {
	const player = ctx.args[1];
	if (player == undefined) {
		await ctx.message.channel.send(Embed.error("Specify a player to get their position"));
		return;
	}

	const onlinePlayers = (await bridge.rcon.send("list")).split(/[, ]/).slice(10);

	if (!onlinePlayers.includes(player)) {
		await ctx.message.channel.send(Embed.error("That player is not online"));
		return;
	}

	const x = (await bridge.rcon.send(`data get entity ${player} Pos[0] 1`)).split(" ")[9];
	const y = (await bridge.rcon.send(`data get entity ${player} Pos[1] 1`)).split(" ")[9];
	const z = (await bridge.rcon.send(`data get entity ${player} Pos[2] 1`)).split(" ")[9];
	const dimensionData = (await bridge.rcon.send(`data get entity ${player} Dimension`)).split(/[:"_]/).slice(-2, -1);
	const dimension = dimensionData[0].charAt(0).toUpperCase() + dimensionData[0].slice(1)

	const embed = new MessageEmbed()
		.setColor(Colors.ENDTECH)
		.setTitle(`${player} is at X: **\`${x}\`** Y: **\`${y}\`** Z: **\`${z}\`** in the \`${dimension}\``)
	await ctx.message.channel.send(embed);
}
