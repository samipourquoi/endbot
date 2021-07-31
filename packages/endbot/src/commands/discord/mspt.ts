import { Command, QuotedType } from "@samipourquoi/commander";
import { Bridge, Bridges } from "../../bridge/bridge";
import { MessageEmbed } from "discord.js";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";
import { Embed } from "../../utils/embeds";

@command(discord)
export class MsptCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("mspt", "tps").run(online)
            .__.with.arg("<server_name>", new QuotedType()).run(online);
    }
}

async function online(ctx: DiscordContext) {
    let bridges = Bridges.getFromMessage(ctx.message);
    if (bridges.length == 0) bridges = Bridges.instances;
    if (ctx.args[1]) {
		for (const bridge of Bridges.instances) {
			if (ctx.args[1] === bridge.config.name) {
				bridges = [bridge]
			}
		}
	}

    for (const bridge of bridges) {
        let result;
        try {
            result = await Mspt(bridge)
        } catch (e) {
            await ctx.message.channel.send(Embed.error("", `${e} to \`${bridge.config.name}\``));
            continue;
        }

        if (isNaN(result.mspt)) {
            await ctx.message.channel.send(Embed.error("That command requires carpet mod on the server!"));
            return;
        }

        const embed = new MessageEmbed()
            .setColor(result.embedColor)
            .setTitle(`${bridge.config.name} - TPS: ${result.tps.toFixed(1)} MSPT: ${result.mspt.toFixed(1)}`);
        await ctx.message.channel.send(embed);
    }

}

async function Mspt(bridge: Bridge) {
    let data = await bridge.rcon.send("script run reduce(last_tick_times(),_a+_,0)/100;");
    let mspt = parseFloat(data.split(" ")[2]);
    let tps = (mspt <= 50) && 20 || 1000 / mspt;
    let embedColor = (mspt <= 25) && Colors.RESULT || (mspt >= 50) && Colors.ERROR || Colors.WARN;
    return {
        mspt,
        tps,
        embedColor
    };
}
