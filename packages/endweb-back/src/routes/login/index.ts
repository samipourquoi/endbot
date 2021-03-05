import { Request, Response, Router } from "express";
import { config } from "endbot";

module.exports = Router()
	.get("/", get)
	.use("/discord", require("./discord"));

function get(req: Request, res: Response) {
	res.redirect(config.web!.oauth2_url);
}