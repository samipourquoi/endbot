import { Command, QuotedType } from "@samipourquoi/commander";
import { Bridge, Bridges } from "../../bridge/bridge";
import { MessageEmbed, Util } from "discord.js";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";
import { Embed } from "../../utils/embeds";

@command(discord)
export class OnlineCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("online", "o").run(online)
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
		const result = await getOnlinePlayers(bridge);

		if (result.onlineCount == 0) {
			await ctx.message.channel.send(Embed.error("", `No player online on \`${ bridge.config.name }\``));
		} else {
			const embed = new MessageEmbed()
				.setColor(Colors.RESULT)
				.setTitle(ctx.message.guild?.name)
				.setDescription(`\`${result.onlineCount}/${result.maxCount}\`` +
					" players online on: `" +
					bridge.config.name + "`")
				.setThumbnail(ctx.message.guild?.iconURL({ format: "png" })!)
				.addField("Player list:",
					Util.escapeMarkdown(result.players
						.map(name => `- ${name}`)
						.join("\n")));
			await ctx.message.channel.send(embed);
		}
	}
}

async function getOnlinePlayers(bridge: Bridge) {
	let data = await bridge.rcon.send("list");
	let response = data.split(" ");
	return {
		onlineCount: +response[2],
		maxCount: (response[6] == "of") ? +response[7] : +response[6],
		players: response.slice(10)
	};
}
