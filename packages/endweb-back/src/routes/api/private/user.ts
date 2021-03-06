/* Routes for getting display user info (profile picture, name, ...)
   once logged on with discord. */

import { Request, Response, Router } from "express";
import { Auth } from "../../../auth";

module.exports = Router()
	.get("/", get)

async function get(req: Request, res: Response) {
	const token = req.header("Authorization")!;
	const user = await Auth.getUserInfo(token);
	if (!user)
		res.status(404)
			.end();
	else
		res.send(user);
}
