import { Config } from "../config";
import { Tail } from "tail"
import { Bridges } from "./bridge";
import { existsSync } from "fs";
import { TextUtils } from "../utils/text";

export module Tails {
	export function init(server : Config.Server) {
		// Copy pasted from:
		// > https://github.com/destruc7i0n/shulker/blob/dc70468459c0b510b5bf8b8c045e9c374b84cad1/src/MinecraftHandler.ts#L135

		if (existsSync(`${server.local_folder_path}/logs/latest.log`)) {
				const tail = new Tail(`${server.local_folder_path}/logs/latest.log`, {useWatchFile: true, fsWatchOptions: {interval: 500}})
				const bridge = Bridges.getFromName(server.name);
				console.log(`[${TextUtils.getCurrentTime()}] Tailing log file in '${server.name}'`);

				tail.on("line", (line: string) => {
				if (!bridge) return;
				bridge.emit("minecraft", line);
				});

				tail.on("error", (error: any) => {
					console.log(`[${TextUtils.getCurrentTime()}] Error when tailing log file: ${error}`);
				});
		} else {
			console.log(`Error: Could not find log file : ${server.local_folder_path}/logs/latest.log`);
		}
	}
}
