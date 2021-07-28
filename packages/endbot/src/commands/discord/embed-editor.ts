import { Command, UnquotedStringType, RestType } from "@samipourquoi/commander";
import { command, discord, DiscordContext } from "../dispatcher";
import { MessageEmbed, TextChannel } from "discord.js";
import { Embed } from "../../utils/embeds";
import fetch from "node-fetch";

@command(discord)
class EmbedCommand
	extends Command {

	static ongoing = new Map();

	static noEmbed = "You don't have an ongoing embed! Do !embed create";

	static invalidArgs = "Invalid arguments! Do `!help embed` for more info.";

	constructor() {
		super();

		this.register
			.with.literal("embed")
			.__.with.arg("<function>", new RestType(new UnquotedStringType())).run(cases);

	}

}

async function cases(ctx: DiscordContext) {
	switch (ctx.arg[0]) {
		case "create":
			await create(ctx, ctx.arg.slice(1));
			break;

		case "delete":
			await EmbedCommand.ongoing.delete(ctx.message.author);
			await ctx.message.channel.send(Embed.error("Successfully deleted your ongoing embed"));
			break;

		case "reset":
			await EmbedCommand.ongoing.delete(ctx.message.author);
			await create(ctx, ctx.arg.slice(1));
			break;

		case "edit":
			await edit(ctx, ctx.arg.slice(1));
			break;

		case "title":
			await title(ctx, ctx.arg.slice(1));
			break;

		case "description":
			await description(ctx, ctx.arg.slice(1));
			break;

		case "footer":
			await footer(ctx, ctx.arg.slice(1));
			break;

		case "color":
			await color(ctx, ctx.arg.slice(1));
			break;

		case "field":
			await field(ctx, ctx.arg.slice(1));
			break;

		case "image":
			await image(ctx, ctx.arg.slice(1));
			break;

		case "thumbnail":
			await thumbnail(ctx, ctx.arg.slice(1));
			break;

		case "publish":
			await publish(ctx, ctx.arg.slice(1));
			break;

		default:
			if (!EmbedCommand.ongoing.has(ctx.message.author)) {
				await ctx.message.channel.send(Embed.error(EmbedCommand.noEmbed));
				break;
		} else {
				await ctx.message.channel.send(EmbedCommand.ongoing.get(ctx.message.author));
		}
	}
}

async function create(ctx: DiscordContext, args: string[]) {
	if (EmbedCommand.ongoing.has(ctx.message.author)) {
			await ctx.message.channel.send(Embed.error("You already have an ongoing embed! Do !embed delete"));
	} else if (args[0] == "from") {
			await createFrom(ctx, args.slice(1));
	} else {
			const embed = new MessageEmbed()
				.setTitle("\u200b")
				// Discord.js cannot send an empty embed apparently so a zero width space character is used

		EmbedCommand.ongoing.set(ctx.message.author, embed);

		await ctx.message.channel.send(EmbedCommand.ongoing.get(ctx.message.author));
	}
}

async function createFrom(ctx: DiscordContext, args: string[]) {
	if (args[0] == undefined) {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	} else {
			try {
					const response = await fetch(args[0])
					try {
							const json = await response.json()
							const embed = new MessageEmbed(json);
							EmbedCommand.ongoing.set(ctx.message.author, embed);
							await ctx.message.channel.send(embed);
					} catch {
							await ctx.message.channel.send(Embed.error("Invalid JSON format"));
							await EmbedCommand.ongoing.delete(ctx.message.author);
					}
			} catch {
					await ctx.message.channel.send(Embed.error("Invalid URL"));
					await EmbedCommand.ongoing.delete(ctx.message.author);
			}
	}
}

async function check(ctx: DiscordContext, args: string[]) {
	if (args[0] == undefined) {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
			return false;
	} else if (!EmbedCommand.ongoing.has(ctx.message.author)) {
			await ctx.message.channel.send(Embed.error(EmbedCommand.noEmbed));
			return false;
	} else {
			return true;
	}
}

async function title(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let title = args.join(" ");
	if (title.match(/^".*"$/s) != null) {
			embed.setTitle(title.substring(1, title.length-1));
			await ctx.message.channel.send(embed);
	} else {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	}
}

async function description(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let description = args.join(" ");
	if (description.match(/^".*"$/s) != null) {
			embed.setDescription(description.substring(1, description.length-1));
			await ctx.message.channel.send(embed);
	} else {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	}
}

async function footer(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let footer = args.join(" ");
	if (footer.match(/^".*"$/s) != null) {
			embed.setFooter(footer.substring(1, footer.length-1));
			await ctx.message.channel.send(embed);
	} else {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	}
}

async function color(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let color = args.join(" ");

	if (color.match(/^#?[0-9a-fA-F]{6}$/) != null) {
			embed.setColor(color);
			await ctx.message.channel.send(embed);
	} else {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	}
}

async function field(ctx:DiscordContext, args: string[]) {
	if (!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	if (args[0] == "add") {
		let result = args.slice(1).join(" ").match(/(^".*"),(".*"),(true|false)$/s);

		if (result != null) {
				let title = result[1];
				let description = result[2];
				let inline = (result[3] == "true");

				embed.addField(
					title.substring(1, title.length-1),
					description.substring(1, description.length-1),
					inline
				);
				await ctx.message.channel.send(embed);
		} else {
				await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
		}
	} else if (args[0] == "splice") {
			let index = args.slice(1).join(" ");
			if (index.match(/^([0-9]|1[0-9]|2[0-4])$/) != null) {
					embed.spliceFields(index, 1);
					await ctx.message.channel.send(embed);
			} else {
				await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
			}
	} else {
			await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	}
}

async function image(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let image = args.join(" ");
	embed.setImage(image);
	await ctx.message.channel.send(embed);
}

async function thumbnail(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let thumbnail = args.join(" ");
	embed.setThumbnail(thumbnail);
	await ctx.message.channel.send(embed);
}

async function publish(ctx: DiscordContext, args: string[]) {
	if(!await check(ctx, args)) return;

	let embed = EmbedCommand.ongoing.get(ctx.message.author);
	let channelID= args[0].slice(2, -1);
	let destination = ctx.message.guild!.channels.cache.get(channelID);

	if (destination?.isText()) {
		if (ctx.message.member!.hasPermission("MANAGE_CHANNELS")) {
			try {
				await destination.send(embed);
				ctx.message.react("✅");
			} catch {
				await ctx.message.channel.send(Embed.error("Endbot doesn't have access to that channel!"));
			}
		} else {
				await ctx.message.channel.send(Embed.error("You don't have permission to do that!"));
		}
	} else {
		await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
	}
}

async function edit(ctx: DiscordContext, args: string[]) {
	// This function replaces the specified message(in the arguments) with the author's embed
 	if(!await check(ctx, args)) return;

	let channelID = args[0].slice(2, -1);
	let messageID = args[1];
	if (!messageID) {
		await ctx.message.channel.send(Embed.error(EmbedCommand.invalidArgs));
		return;
	}

	let channel: TextChannel = ctx.message.guild!.channels.cache.get(channelID) as TextChannel;
	try {
			let message = channel.messages.fetch(messageID)
			.then(message => {
					if (ctx.message.member!.hasPermission("MANAGE_CHANNELS")) {
								message.edit(EmbedCommand.ongoing.get(ctx.message.author))
								.then(message => ctx.message.react("✅"))
								.catch(error => ctx.message.channel.send(Embed.error("You can only edit Endbot messages!")));
					} else {
								ctx.message.channel.send(Embed.error("You don't have permission to do that!"));
					}
			}).catch(error => {
					ctx.message.channel.send(Embed.error(error));
			});
	} catch {
			await ctx.message.channel.send(Embed.error("Unknown channel!"));
	}
}
