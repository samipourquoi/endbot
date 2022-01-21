import { ICommandInfo } from "../interfaces";
import { Message } from "discord.js";

export class Command {
	name!: string;
	aliases!: string[];
	description!: string;
	usage!: string;
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

	async run(): Promise<void> {
		throw new Error("This command has no functionality!");
	}

	async hasPermission(message: Message): Promise<boolean> {
		for (const role of this.roles_allowed) {
			if (message.member!.roles.cache.has(role)) return true;
		}

		for (const user of this.users_allowed) {
			if (user === message.member!.id) return true;
		}

		// If no permissions are set, everyone has access to the command
		return this.roles_allowed.length === 0 && this.users_allowed.length === 0;
	}
}