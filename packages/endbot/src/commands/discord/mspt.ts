import { Command } from "@samipourquoi/commander";
import { Bridge, Bridges } from "../../bridge/bridge";
import { MessageEmbed } from "discord.js";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";

@command(discord)
export class MsptCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("mspt", "tps").run(online); 
    }
}

async function online(ctx: DiscordContext) {
    let bridges = Bridges.getFromMessage(ctx.message);
    if (bridges.length == 0) bridges = Bridges.instances;

    for (const bridge of bridges) {
        const result = await Mspt(bridge);

        const embed = new MessageEmbed()
            .setColor(result.embedColor)
            .setTitle(`${bridge.config.name} - TPS: ${result.tps.toFixed(1)} MSPT: ${result.mspt.toFixed(1)}`);
        await ctx.message.channel.send(embed);
    }

}

async function Mspt(bridge: Bridge) {
    let data = await bridge.rcon.send("script run reduce(last_tick_times(),_a+_,0)/100;");
    let response = parseFloat(data.split(" ")[2]);
    let tps = (response <= 50) && 20 || 1000/response;
    let embedColor = (response <= 25) && Colors.RESULT || (response >= 50) && Colors.ERROR || Colors.WARN;
    return {
        mspt: response,
        tps,
        embedColor
    };
}
