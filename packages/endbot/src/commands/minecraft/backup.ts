import { Command } from "@samipourquoi/commander";
import { command, minecraft, MinecraftContext } from "../dispatcher";
import { TextUtils } from "../../utils/text";
import { Bridges } from  "../../bridge/bridge";
import { readFileSync, existsSync } from "fs";
const util = require("util");
const exec = util.promisify(require("child_process").exec);

@command(minecraft)
export class BackupCommand
	extends Command {

	constructor() {
		super();

		this.register
			.with.literal("backup").run(backup);
	}
}

async function backup(ctx: MinecraftContext) {
	if (!existsSync(ctx.bridge.config.backup_folder_path)) {
		await ctx.bridge.error("Backup failed: Could not find backup folder");
		return;
	}

	// Gets a list of operators on the server. Gets the data from the server's ops.json
	const data = readFileSync(`${ctx.bridge.config.local_folder_path}/ops.json`, "utf-8");
	const ops = data.replace(/"|,|\n| /g, "").split(/name:|level:/)
	const opNames = ops.filter((element, index) => index % 2 === 1);

	if (!opNames.includes(ctx.author)) {
		await ctx.bridge.error("You need to be OP to run that command!")
		return;
	}

	const backup_name = `${ctx.bridge.config.name}_on_${TextUtils.getCurrentDate()}_at_${TextUtils.getCurrentTime()}`
	await ctx.bridge.succeed("Running a backup...");

	try {
			await exec(`zip -r ${ctx.bridge.config.backup_folder_path}/${backup_name} ${ctx.bridge.config.local_folder_path}/world`);
	} catch (e) {
			await ctx.bridge.error("Failed to create a backup: " + e);
	}

	await ctx.bridge.succeed(`Backup has been created successfully: ${backup_name}`);
}
