import { Request, Response, Router } from "express";
import { Database } from "endbot/dist/database";
import { GetAppInfo } from "../../../api";

module.exports = Router()
	.get("/", getApps);

async function getApps(req: Request, res: Response) {
	const [apps] = await Database.sequelize.query(`
	  SELECT status, round, applicants.* FROM tickets
	    JOIN applicants
	`) as unknown as [GetAppInfo[]];
	console.log(apps);
	res.send(apps);
}
