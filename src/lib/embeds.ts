import { EmbedBuilder } from "discord.js";

export type Embed = ErrorEmbed | InfoEmbed;

const Colors = {
    ERROR: 0xfc251e,
    INFO: 0x86ff40,
};

export class ErrorEmbed extends EmbedBuilder {
    constructor(errorMsg: string, title: string = "") {
        super({
            title: title,
            description: errorMsg,
            color: Colors.ERROR,
        });
    }
}

export class CommandNotFoundEmbed extends ErrorEmbed {
    constructor(command: string) {
        super(`Unable to find command: '${command}'`, "Command Not Found");
    }
}

export class InvalidPermissionsEmbed extends ErrorEmbed {
    constructor(command: string) {
        super(`You don't have permission to run the command: '${command}'`, "Invalid Permissions");
    }
}

export class InfoEmbed extends EmbedBuilder {
    constructor(title: string, description: string) {
        super({
            title: title,
            description: description,
            color: Colors.INFO,
        });
    }
}
