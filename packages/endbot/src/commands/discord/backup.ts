import { Command, UnquotedStringType } from "@samipourquoi/commander";
import { MessageEmbed } from "discord.js";
import { Bridge, Bridges } from "../../bridge/bridge";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";
import { config } from "../../index";
import { Embed } from "../../utils/embeds";
import { existsSync } from "fs";
import { TextUtils } from "../../utils/text";
const util = require("util");
const exec = util.promisify(require("child_process").exec);

@command(discord)
class BackupCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("backup").run(online)
						.with.arg("<server>", new UnquotedStringType).run(online);
    }
}

async function online(ctx: DiscordContext) {
	let bridges = Bridges.getFromMessage(ctx.message);

	if (bridges.length == 0 && ctx.args[1] == null) {
		await ctx.message.channel.send(Embed.error("Specify the server you want to backup"));
		return;
	}
	if (ctx.args[1]) {
		for (const bridge of Bridges.instances) {
			if (ctx.args[1] === bridge.config.name) {
				bridges = [bridge]
			}
		}
	}
	if (bridges[0] == null) {
		await ctx.message.channel.send(Embed.error("Server not found"));
		return;
	}
	let bridge = bridges[0];

	if (Bridges.checkOP(true)) {
		if (!ctx.message.member?.roles.cache.has(config.op_role)) {
			await ctx.message.channel.send(Embed.error("You need to be OP to run !backup"));
			return;
		}
	}

	if (existsSync(bridge.config.backup_folder_path)) {
			if (!existsSync(bridge.config.local_folder_path)) {
				await ctx.message.channel.send(Embed.error("Backup failed: Could not find world folder"));
				return;
			}

			const embed = new MessageEmbed()
			.setColor(Colors.RESULT)
			.setTitle(`Running a backup for ${bridge.config.name}...`)

			const createEmbed = await ctx.message.channel.send(embed);
			let backupName

			try {
					backupName = await backup(bridge);
			} catch (e) {
					await ctx.message.channel.send(Embed.error("Failed to create a backup", e));
			}

			await createEmbed.delete();
			if (backupName == null) return;

			const finishEmbed = new MessageEmbed()
				.setColor(Colors.RESULT)
				.setTitle("Backup has been created successfully!")
				.setFooter(backupName)

			await ctx.message.channel.send(finishEmbed);
	} else {
			await ctx.message.channel.send(Embed.error("The backup folder specified in your config file does not exist!"));
	}
}

async function backup(bridge: Bridge) {
	const backupName = `${bridge.config.name}_on_${TextUtils.getCurrentDate()}_at_${TextUtils.getCurrentTime()}`

	await exec(`zip -r ${bridge.config.backup_folder_path}/${backupName} ${bridge.config.local_folder_path}/world`);
	return backupName;
}

async function autoBackup(bridge: Bridge) {
			console.log(`[${TextUtils.getCurrentTime()}] Creating a scheduled backup for '${bridge.config.name}'`)
			let backupName;
			try {
					backupName = await backup(bridge);
			} catch (e) {
					console.log(`[${TextUtils.getCurrentTime()}] Failed to create a scheduled backup for '${bridge.config.name}': ${e}`);
					return;
			}
			if (backupName == null) return console.log(`Could not create a backup for ${bridge.config.name}`);

			console.log(`[${TextUtils.getCurrentTime()}] Successfully created a scheduled backup for '${bridge.config.name}': ${backupName}`);
}

export function backupScript() {
	for (const bridge of Bridges.instances) {
		if (bridge.config.auto_backups) {
			const backupInterval = parseFloat(bridge.config.backup_interval) * 3_600_000;
			if (isNaN(backupInterval)) return console.log(`Invalid backup_interval for ${bridge.config.name}`);
			setInterval(() => autoBackup(bridge), backupInterval);
		}
	}
}
