import * as express from "express";
import { apiRouter } from "./api";
import { config } from "../index";

export module Web {
	export const app = express();

	export function init() {
		if (!config.web) return;

		app.use("/api", apiRouter);

		const { port } = config.web;
		app.listen(port, () => {
			console.info(`Web server is listening on port ${port}: http://localhost:${port}`);
		});
	}
}
