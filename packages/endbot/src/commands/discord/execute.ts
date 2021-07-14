import { Command, RestType, UnquotedStringType } from "@samipourquoi/commander";
import { MessageEmbed } from "discord.js";
import { Bridge, Bridges } from "../../bridge/bridge";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";
import { config } from "../../index";
const invalidCommands = require("../../../assets/invalid_commands.json");

@command(discord)
export class ExecuteCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("execute")
            .__.with.arg("<command>", new RestType(new UnquotedStringType())).run(online);
            
    }
}

async function online(ctx: DiscordContext) {

    let bridges = Bridges.getFromMessage(ctx.message);

    if (bridges.length == 0) {
        let embed = new MessageEmbed()
            .setColor(Colors.ERROR)
            .setTitle("You must be in a bridge channel to do that!");
        await ctx.message.channel.send(embed);    
        return;
    }

    if (Bridges.checkOP(true)) {
        if (!ctx.message.member?.roles.cache.has(config.op_role)) {
            await ctx.message.channel.send("You need to be OP to run !execute");
            return;
        }
    }
    await execute(bridges[0], ctx);
}

async function execute(bridge: Bridge, ctx: DiscordContext) {
    let command = ctx.arg.join(" ");
    let response = await bridge.rcon.send(command);
    let embedColor = Colors.RESULT

    if(!response) return;

    for (const word of invalidCommands) {
        if (response.includes(word)) {
            embedColor = Colors.ERROR;
            response = word;
        }
    }
    
    const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(response)
    await ctx.message.channel.send(embed)
}
