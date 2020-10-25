"use strict";

const Discord = require("discord.js");
const { generate } = require("../../../../src/misc/embeds.js");
const Command = require("../../../../src/commands/Command.js");

class List extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "List",
			"usage": "list",
			"description": "Lists all people with certain role"
    };

    const guild = client.guilds.cache.get('768847066356645910');
	}

	async run(message, args) {
    if (!message.member.roles.cache.has(this.client.config["backup-role"])) {
			message.channel.send("da fuck you tryin' to do");
			return;
		}

    let role = args.join(' ');

    let roles = {
      everyone: '761385633088274442'
    };
    
    let selectedRole;
    let titleMsg = `People with ${role}:`;

    message.guild.roles.cache.forEach((role) => {
      if (!(role.name === '@everyone')) {
        roles[role.name] = role.id;
      }
    });

    const selectRole = () => {
      for (let i = 0; i < Object.keys(roles).length; i++) {
        if (role === Object.keys(roles)[i]) {
          selectedRole = Object.values(roles)[i];
          return true;
        }
      }
    }

    if (role === '') {
      selectedRole = roles.everyone;
      titleMsg = 'Everyone:';
    } else {
      if (!selectRole()) {
        message.channel.send('Bruh that role doesn\'t even exist');
        return;
      }
    }
    
    let membersWithRole = message.guild.roles.cache.get(selectedRole).members.map(m => m.user.tag);

    await message.channel.send(await this.output(membersWithRole, titleMsg));
  }
  
  async output(members, titleMsg) {
    let embedColor = 'result';

    let embed = generate(embedColor)
      .setTitle(titleMsg)
      .setDescription(members);
    return embed;
  }
}

module.exports = List;