import * as express from "express";
import { config, instance } from "endbot";
import { router } from "./routes";

export const web = express()
	.use(router);
const port = config.web?.port ||
	process.env.PORT ||
	8080;

instance.once("ready", initWebServer);

function initWebServer() {
	web.listen(port, () => console.log(`Web server listening to port ${port}`));
}
