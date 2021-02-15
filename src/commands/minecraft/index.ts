import { Command, Context } from "@samipourquoi/commander";
import { Bridge } from "../../bridge/bridge";
import { HelpCommand } from "./help";

export class MinecraftDispatcher
	extends Command {

	constructor() {
		super();

		this.register
			.with.attach(new HelpCommand());
	}
}

export type MinecraftContext = Context<MinecraftClosure>;

export interface MinecraftClosure {
	line: string,
	author: string,
	content: string,
	bridge: Bridge
}
