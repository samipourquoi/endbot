import { Embed, ErrorEmbed, InfoEmbed } from "../../lib/embeds.js";
import { TextChannel, escapeMarkdown } from "discord.js";
import { Bridge } from "../../bridge.js";
import { Command } from "../command.js";
import { ICommandContext } from "../../lib/interfaces.js";
import { discordCommand } from "../commandHandler.js";

@discordCommand
export class OnlineCommand extends Command {
    constructor() {
        const defaultCmdInfo = {
            name: "online",
            aliases: ["o"],
            short_description: "Get a list of all online players on the server",
            description:
                "By default, a list will be shown for each server. Provide a server " +
                "name to list players online on a specific server",
            usage: "online [serverName]",
        };

        super(defaultCmdInfo);
    }

    async run(ctx: ICommandContext): Promise<void> {
        const queriedBridges = this.getQueriedBridges(ctx.args, ctx.bridges);

        const embeds = [];
        if (queriedBridges.length === 0) {
            // One bridge will always be set up if this point is reached, so zero queried bridges
            // always means at least one argument was provided.
            const embed = new ErrorEmbed(`No server named '${ctx.args[0]}'`);
            embeds.push(embed);
        } else {
            for (const bridge of queriedBridges) {
                const playerInfo = await this.getOnlinePlayers(bridge);
                const embed = this.formatEmbed(playerInfo, bridge, ctx.channel);
                embeds.push(embed);
            }
        }

        ctx.channel.send({ embeds: embeds });
    }

    private getQueriedBridges(args: string[], bridges: Bridge[]): Bridge[] {
        if (args.length <= 0) {
            return bridges;
        }

        return bridges.filter((bridge) => bridge.name === args[0]);
    }

    private async getOnlinePlayers(bridge: Bridge): Promise<IPlayerInfo> {
        const data = await bridge.sendMinecraftCommand("list");
        const response = data.split(" ");
        return {
            onlineCount: Number(response[2]),
            maxCount: Number(response[7]),
            playerList: response.slice(10),
        };
    }

    private formatEmbed(playerInfo: IPlayerInfo, bridge: Bridge, channel: TextChannel): Embed {
        if (playerInfo.onlineCount === 0) {
            return new ErrorEmbed(`No players online on \`${bridge.name}\``);
        }

        const guildName = channel.guild.name;
        const guildIcon = channel.guild.iconURL();
        const description =
            `\`${playerInfo.onlineCount}/${playerInfo.maxCount}\` players online ` +
            `on: \`${bridge.name}\``;
        return new InfoEmbed(guildName, description).setThumbnail(guildIcon).addFields({
            name: "Player list:",
            value: escapeMarkdown(playerInfo.playerList.map((name) => `- ${name}`).join("\n")),
        });
    }
}

interface IPlayerInfo {
    onlineCount: number;
    maxCount: number;
    playerList: string[];
}
