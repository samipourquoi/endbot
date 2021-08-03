import { Command, UnquotedStringType, RestType } from "@samipourquoi/commander";
import { command, discord, DiscordContext } from "../dispatcher";
import { MessageEmbed } from "discord.js";
import { Colors } from "../../utils/theme";

@command(discord)
class HelpCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("help").run(discordHelp)
			.__.with.arg("<command>", new RestType(new UnquotedStringType())).run(discordHelp);
	}
}

async function discordHelp(ctx: DiscordContext) {
	const command = ctx.args[1]
	const help = await getCommand(command)
	if (!help) return getHelp(ctx);

	const embed = new MessageEmbed()
		.setColor(Colors.ENDTECH)
		.setTitle(help.name)
		.setDescription(`${help.description}\n \`${help.usage}\``)

	await ctx.message.channel.send(embed);
}

async function getCommand(command: string) {
	return commands[command];
}

async function getHelp(ctx: DiscordContext) {
	const embed = new MessageEmbed()
		.setColor(Colors.ENDTECH)
		.setTitle("Help panel")

	for (const key in commands) {
		embed.addField(
			`**${commands[key].name}**`,
			`${commands[key].description}\n \`${commands[key].usage}\``
		);
	}
	return ctx.message.channel.send(embed);
}

const commands: {[command: string]: commandInfo} = {
	help:
	{
		name: "Help command",
		usage: "help [command]",
		description: "Get help with a command"
	},

	backup:
	{
		name: "Backup command",
		usage: "backup [servername]",
		description: "Creates a backup for the server"
	},

	embed:
	{
		name: "Embed editor",
		usage: "embed create",
		description: "Create and edit embeds"
	},

	execute:
	{
		name: "Execute command",
		usage: "execute <command>",
		description: "Execute a command on a server from a bridge channel"
	},

	links:
	{
		name: "Discord Links",
		usage: "links add",
		description: "Add discord invitations to an embed"
	},

	list:
	{
		name: "List command",
		usage: "list [role]",
		description: "Lists all people with the specified role"
	},

	mspt:
	{
		name: "MSPT command",
		usage: "mspt [servername]",
		description: "Gets the TPS and MSPT the server is running at"
	},

	online:
	{
		name: "Online command",
		usage: "online [servername]",
		description: "Gets a list of all online players on the server"
	},

	pos:
	{
		name: "Pos command",
		usage: "pos <playername>",
		description: "Gets the position of a player"
	},

	scoreboard:
	{
		name: "Scoreboard command",
		usage: "scoreboard <objectives> [flag]",
		description: "Displays a scoreboard of the specified objective",
	}
}

interface commandInfo {
	name: string;
	usage: string;
	description: string;
}
