import { Command, QuotedType, UnquotedStringType } from "@samipourquoi/commander";
import { EmbedFieldData, Guild, MessageEmbed, TextChannel } from "discord.js";
import { Colors } from "../../utils/theme";
import { config, instance } from "../../index";
import * as Canvas from "canvas";
import { command, discord, DiscordContext } from "../dispatcher";
import { LinkModel } from "../../models/link-model";
import { Embed } from "../../utils/embeds";

@command(discord)
export class LinksCommand
	extends Command {

	public static emoteServer: Guild | null = null;

	constructor() {
		super();
		if (!config.discord_links) return;

		this.register.with.literal("links", "link")
			.with.literal("add")
			.__.with.arg("<invite>", new UnquotedStringType()).run(add)
			.__.__.with.arg("<registry>", new UnquotedStringType()).run(add)
			.__.__.end!
			.__.end!
			.or.literal("remove")
			.__.with.arg("<invite>", new UnquotedStringType()).run(remove)
			.__.__.with.arg("<registry>", new UnquotedStringType()).run(remove)
			.__.__.end!
			.__.end!
			.or.literal("publish")
			.__.with.arg("<channel>", new UnquotedStringType())
			.__.__.with.arg("<title>", new QuotedType()).run(publish)
			.__.__.__.with.arg("<registry>", new UnquotedStringType()).run(publish);
	}
}

async function add(ctx: DiscordContext) {
	const [,, link, registry = "default" ] = ctx.args;
	let invite;
	try {
		invite = await instance.fetchInvite(link);
	} catch {
		await ctx.message.channel.send(Embed.error("", "You must provide a valid invite!"));
		return;
	}
	const emote = await createEmote(invite.guild!);
	if (emote == null) throw new Error("can't create emote");

	await LinkModel.create({
		invite: link,
		emote: emote.identifier,
		registry,
		server_name: invite.guild!.name
	});

	const embed = new MessageEmbed()
		.setColor(Colors.RESULT)
		.setDescription(`Added server ${ invite.guild?.name } ${ emote }`);
	await ctx.message.channel.send(embed);

	const formatted = await formatCard(registry);
	await ctx.message.channel.send(formatted);
}

async function remove(ctx: DiscordContext) {
	const [,, invite, registry = "default" ] = ctx.args;

	await LinkModel.destroy({
		where: { invite, registry }
	});

	const embed = new MessageEmbed()
		.setColor(Colors.RESULT)
		.setDescription(`Removed link ${invite}`);
	await ctx.message.channel.send(embed);
}

async function publish(ctx: DiscordContext) {
	const [,, channelID, title, registry = "default" ] = ctx.args as string[];
	const channel = await instance.channels.fetch(channelID.substring(2, channelID.length - 1));
	const formatted = await formatCard(registry);
	formatted.setTitle(title);

	if (channel instanceof TextChannel) {
		await channel.send(formatted);
	}
}

async function createEmote(guild: Guild) {
	const emoteName = guild.name.toLowerCase()
		.replace(/[^\w ]/g, "")
		.replace(/ /g, "_");
	const iconURL = guild.iconURL({ format: "png" });
	if (!iconURL) return null;

	const canvas = Canvas.createCanvas(128, 128);
	const context = canvas.getContext("2d");
	const image = await Canvas.loadImage(iconURL);
	context.beginPath();

	// How to draw a rounded Rectangle on HTML Canvas?
	// > https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
	context.moveTo(128, 128);
	context.arcTo(0, 128, 0, 0, 40);
	context.arcTo(0, 0, 128, 0, 40);
	context.arcTo(128, 0, 128, 128, 40);
	context.arcTo(128, 128, 0, 128, 40);
	context.clip();

	context.drawImage(image, 0, 0, 128, 128);
	context.closePath();

	const buffer = canvas.toDataURL();
	const emoteServer = instance.guilds.resolve(config.discord_links!.emote_server_id);
	return await emoteServer?.emojis
		.create(buffer, emoteName) || null;
}

async function formatCard(registry: string):
	Promise<MessageEmbed> {

	const entries = await LinkModel.findAll({
		where: { registry }
	});
	entries.sort((a, b) => {
		const [ nameA, nameB ] = [ a.get("server_name"), a.get("server_name") ] as string[];
		return nameA.localeCompare(nameB);
	});
	const fields: EmbedFieldData[] = entries.map(entry => {
		const [ emote, name, link ] = [
			entry.get("emote") as string,
			entry.get("server_name") as string,
			entry.get("invite") as string
		];

		return {
			name: `<:${emote}> ${name}`,
			value: `[${link.substring(8)}](${link})`
		};
	});
	return new MessageEmbed()
		.addFields(fields)
		.setColor(Colors.TRANSPARENT);
}
