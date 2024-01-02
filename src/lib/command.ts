import { EmbedBuilder, GuildMember } from "discord.js";
import { ICommandInfo } from "../interfaces.js";

export class Command {
    name: string;
    aliases: string[];
    description: string;
    usage: string;
    roles_allowed: string[];
    users_allowed: string[];

    constructor(info: ICommandInfo) {
        this.name = info.name;
        this.aliases = info.aliases || [];
        this.description = info.description;
        this.usage = info.usage;
        this.roles_allowed = info.roles_allowed || [];
        this.users_allowed = info.users_allowed || [];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async run(args: string[]): Promise<EmbedBuilder> {
        throw new Error("This command has no functionality!");
    }

    async hasPermission(member: GuildMember): Promise<boolean> {
        for (const role of this.roles_allowed) {
            if (member.roles.cache.has(role)) return true;
        }

        for (const user of this.users_allowed) {
            if (user === member.id) return true;
        }

        // If no permissions are set, everyone has access to the command
        return this.roles_allowed.length === 0 && this.users_allowed.length === 0;
    }
}
