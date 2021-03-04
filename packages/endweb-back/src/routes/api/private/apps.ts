import { Request, Response, Router } from "express";

module.exports = Router()
	.get("/", getApps);

function getApps(req: Request, res: Response) {
	res.send("test");
}
