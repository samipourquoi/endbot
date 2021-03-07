import { Request, Response, Router } from "express";
import { Database, Schemas } from "endbot/dist/database";
import { GETAppInfo } from "../../../api";

module.exports = Router()
	.get("/", getApps)
	.get("/:id", getChannel);

async function getApps(req: Request, res: Response) {
	const [apps] = await Database.sequelize.query(`
	  SELECT tickets.created_at, status, round, channel_id, applicants.* FROM tickets
	    JOIN applicants
	`) as unknown as [GETAppInfo[]];
	res.send(apps);
}

async function getChannel(req: Request, res: Response) {
	const { id } = req.params;
	const ticket = await Database.Tickets.findOne({ where: { channel_id: id } });
	if (!ticket) {
		res.status(404)
			.end();
		return;
	}
	const messages = JSON.parse(ticket.get("raw_messages") as string);
	res.send(messages);
}
