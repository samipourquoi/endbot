"use strict";

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
	}

	async run(message, args) {
    let role = args.join(" ").toLowerCase();
    
    if (role === '') {
      if (!message.member.roles.cache.has(this.client.config["backup-role"])) {
        message.channel.send("da fuck you tryin' to do");
        return;
      }
    }

		let roles = {};
    
		let selectedRole;
    let titleMsg = `People with ${role}:`;

		message.guild.roles.cache.forEach((role) => {
			if (!(role.name === "@everyone")) {
				roles[role.name] = role.id;
			} else {
        // roles['everyone'] = role.id;
      }
		});

		const selectRole = () => {
			for (let i = 0; i < Object.keys(roles).length; i++) {
				if (role === Object.keys(roles)[i]) {
					selectedRole = Object.values(roles)[i];
					return true;
				}
			}
		};

		if (role === '' || role === 'everyone') {
			// selectedRole = roles.everyone;
      // titleMsg = "Everyone:";
      
      message.channel.send('You currently can\'t list everyone');
      return;
		} else {
			if (!selectRole()) {
				message.channel.send("Bruh that role doesn't even exist");
				return;
			}
		}
    
    let membersWithRole = message.guild.roles.cache.get(selectedRole).members.map(m => m.user.tag);

    if (String(membersWithRole) === '') {
      message.channel.send('There are no people with this role');
    } else {
      await message.channel.send(await this.output(membersWithRole, titleMsg));
    }
	}
  
	async output(members, titleMsg) {
    // commented out code is stuff for sending embeds that are greater than 2000 characters

    // let embed;
    let embedColor = 'result';
    // let big;

    // if (String(members).length >= 2048) {
    //   big = true;

    //   const half = Math.ceil(members.length / 2);    

    //   const members1 = members.splice(0, half);
    //   const members2 = members.splice(-half);

    //   embed = generate(embedColor)
    //     .setTitle(titleMsg)
    //     .setDescription(members1);

    //   return embed;
    // } else {
    //   embed = generate(embedColor)
    //     .setTitle(titleMsg)
    //     .setDescription(members)
    
    //   return embed;
    // }

    let embed = generate(embedColor)
      .setTitle(titleMsg)
      .setDescription(members)

    return embed;
	}
}

module.exports = List;