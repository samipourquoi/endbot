import { NextFunction, Request, Response, Router } from "express";
import { Auth } from "../../../auth";

module.exports = Router()
	.all("/*", isAuthed)
	.use("/form", require("./form"))
	.use("/apps", require("./apps"))

async function isAuthed(req: Request, res: Response, next: NextFunction) {
	const token = req.header("Authorization")
	if (token && await Auth.isLoggedIn(token)) {
		next();
	} else {
		res.status(401)
			.end();
	}
}
