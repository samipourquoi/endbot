import { Config } from "../config";
import { Tail } from "tail"
import { Bridges } from "./bridge";
import { existsSync } from "fs";

export module Tails {
	export function init(server : Config.Server) {
		// Copy pasted from:
		// > https://github.com/destruc7i0n/shulker/blob/dc70468459c0b510b5bf8b8c045e9c374b84cad1/src/MinecraftHandler.ts#L135

		if (existsSync(server.local_log_file_path)) {
				const tail = new Tail(server.local_log_file_path, {useWatchFile: true})
				const bridge = Bridges.getFromName(server.name);
				console.log(`Tailing log file in '${server.name}'`);

				tail.on("line", (line: string) => {
				if (!bridge) return;
				bridge.emit("minecraft", line);
				});

				tail.on("error", (error: any) => {
					console.log("Error when tailing log file: " + error);
				});
		} else {
			console.log("Error: Could not find log file : " + server.local_log_file_path);
		}
	}
}
