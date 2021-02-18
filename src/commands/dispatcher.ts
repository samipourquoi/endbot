import { Command, Context } from "@samipourquoi/commander";
import { Bridge } from "../bridge/bridge";
import { Message } from "discord.js";

class Dispatcher
	extends Command {

	constructor() {
		super();
	}

	attach(command: Command) {
		this.register.or.attach(command);
	}
}

export const discord = new Dispatcher();

export const minecraft = new Dispatcher();

export type MinecraftContext = Context<MinecraftClosure>;

export interface MinecraftClosure {
	line: string,
	author: string,
	content: string,
	bridge: Bridge
}

export type DiscordContext = Context<DiscordClosure>

export type DiscordClosure = {
	message: Message,
}

export function command(dispatcher: Dispatcher) {
	return (constructor: new () => Command) => {
		dispatcher.attach(new constructor());
	}
}