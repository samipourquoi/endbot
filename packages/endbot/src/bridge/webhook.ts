import * as express from "express";
import { Request, Response } from "express";
import { Bridges } from "./bridge";
import { config } from "../index";
import { TextUtils } from "../utils/text";

export module Webhook {
	export const webhook = express();

	export function init() {
		// Copy pasted from:
		// > https://github.com/destruc7i0n/shulker/blob/dc70468459c0b510b5bf8b8c045e9c374b84cad1/src/MinecraftHandler.ts#L135
		webhook.use((request, _response, next) => {
			request.body = "";
			request.setEncoding("utf8");

			request.on("data", (chunk: string) => {
				request.body += chunk;
			});

			request.on("end", function () {
				next();
			});
		})

		webhook.post("/link/:server/", (req: Request, res: Response) => {
			const server = req.params.server;
			const bridge = Bridges.getFromName(server);
			const line = req.body;

			// TODO: Check if ip is allowed

			if (!bridge || !line) {
				res.status(404)
					.end();
				return;
			}

			bridge.emit("minecraft", line);

			res.status(200)
				.end();
		});

		const port = config.webhook_port || 34345;
		webhook.listen(port, () => {
			console.info(`[${TextUtils.getCurrentTime()}] Webhook listening to port ${port}`);
		});
	}
}
