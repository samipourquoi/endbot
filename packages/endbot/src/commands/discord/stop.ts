import { Command } from "@samipourquoi/commander";
import { Bridges } from "../../bridge/bridge";
import { command, discord, DiscordContext } from "../dispatcher";
import { config } from "../../index";
import { Embed } from "../../utils/embeds";
import { MessageEmbed } from "discord.js";
import { Colors } from "../../utils/theme";
import { TextUtils } from "../../utils/text";

@command(discord)
export class StopCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("stop").run(stop);
    }
}

async function stop(ctx: DiscordContext) {
    if (!ctx.message.member?.roles.cache.has(config.op_role)) {
        await ctx.message.channel.send(Embed.error("You need to be OP to run !stop"));
    } else {
        const embed = new MessageEmbed()
            .setColor(Colors.ERROR)
            .setTitle("Stopping...")
            .setFooter(`Stopped by: ${ctx.message.author.username}`, ctx.message.author.displayAvatarURL())

        await ctx.message.channel.send(embed);
        console.log(`[${TextUtils.getCurrentTime()}] Bot stopped by ${ctx.message.author.username}`)
        process.exit();
    }
}
