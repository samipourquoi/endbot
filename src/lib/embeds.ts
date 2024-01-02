import { EmbedBuilder } from "discord.js";

const Colors = {
    ERROR: 0xfc251e,
};

export class CommandNotFoundEmbed extends EmbedBuilder {
    constructor(command: string) {
        super({
            title: "Command Not Found",
            description: `Unable to find command: '${command}'`,
            color: Colors.ERROR,
        });
    }
}

export class InvalidPermissionsEmbed extends EmbedBuilder {
    constructor(command: string) {
        super({
            title: "Invalid Permissions",
            description: `You don't have permission to run the command: '${command}'`,
            color: Colors.ERROR,
        });
    }
}
