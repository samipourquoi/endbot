import { Command, UnquotedStringType, RestType } from "@samipourquoi/commander";
import { command, minecraft, MinecraftContext } from "../dispatcher";
import { commandInfo } from "../discord/help";

@command(minecraft)
export class HelpCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("help").run(serverHelp)
			.__.with.arg("<command>", new RestType(new UnquotedStringType())).run(serverHelp);
	}
}

async function serverHelp(ctx: MinecraftContext) {
	const command = (ctx.args[1]) ? ctx.arg.join(" ").toLowerCase() : false;
	const helpMessage = [];

	for (const key in commands) {
		let commandDetails = commands[key];
		if (command && commands[command]) commandDetails = commands[command];
		const name = `{"text":"${commandDetails.name}","color":"gray","hoverEvent":{"action":"show_text","value":"${commandDetails.description}"}}`;
		const usage = `{"text":": ${commandDetails.usage}","color":"white"}`;
		helpMessage.push(`${name}, ${usage}`);
		if (command && commands[command]) break;
	}
	const message = "[\"\"," + helpMessage.join(",\"\\n\",") + "]";
	await ctx.bridge.rcon.send(`tellraw @a ${message}`);
}

const commands: {[command: string]: commandInfo} = {
	help:
	{
		name: "Help",
		usage: "help [command]",
		description: "Get help with a command"
	},

	backup:
	{
		name: "Backup",
		usage: "backup",
		description: "Creates a backup for the server"
	},

	pos:
	{
		name: "Pos",
		usage: "pos <playername>",
		description: "Gets the position of a player"
	},

	scoreboard:
	{
		name: "Scoreboard",
		usage: "scoreboard <objective> [flag]",
		description: "Displays a scoreboard of the specified objective",
	}
}
