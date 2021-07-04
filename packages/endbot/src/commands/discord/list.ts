import { Command, QuotedType } from "@samipourquoi/commander";
import { MessageEmbed } from "discord.js";
import { command, discord, DiscordContext } from "../dispatcher";
import { Colors } from "../../utils/theme";

@command(discord)
class ListCommand
  extends Command {

  constructor() {
    super();

    this.register
      .with.literal("list")
      .__.with.arg("<role>", new QuotedType()).run(roles);
  }
}
// To-Do: Add functionality to work with multi-word roles
async function roles(ctx: DiscordContext) {
  const chosenRole = ctx.args[1];
  let validRole = false;
  const members = await ctx.message.guild!.members.fetch();

  ctx.message.guild!.roles.cache.forEach(async (role) => {
    if (role.name != "@everyone") {
      if (role.name.toLowerCase() === chosenRole) {
        validRole = true;
        let membersWithRole: string[] = [];

        members.forEach(member => {
          if (member.roles.cache.find(role => role.name.toLowerCase() === chosenRole)) membersWithRole.push(member.user.toString());
        });

        await output(membersWithRole);
      }
    }
  });

  if (!validRole) ctx.message.channel.send("That role doesn't exist");

  async function output(members: any) {
    const embed = new MessageEmbed()
        .setColor(Colors.RESULT)
        .setTitle(`There are ${members.length} people with ${chosenRole}`)
        .setDescription(members)

    await ctx.message.channel.send(embed);
  }
}