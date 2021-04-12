import { Request, Response, Router } from "express";
import { GETAppInfo, GETChannel } from "../../../api";
import { TicketModel } from "endbot/dist/models/ticket-model";
import { ApplicantModel } from "endbot/dist/models/applicant-model";
import { ArchiveChannelModel } from "endbot/dist/models/archive-channel-model";

module.exports = Router()
	.get("/", getApps)
	.get("/:id", getChannel);

async function getApps(req: Request, res: Response) {
	// const [apps] = await Database.sequelize.query(`
	//   SELECT tickets.created_at, status, round, channel_id, applicants.* FROM tickets
	//     JOIN applicants
	// `) as unknown as [GETAppInfo[]];
	const apps = await TicketModel.findAll({
		// @ts-ignore
		include: ApplicantModel
	});
	res.send(apps);
}

async function getChannel(req: Request, res: Response) {
	const { id } = req.params;
	const channel = await ArchiveChannelModel.findOne({
		where: { channel_id: id }
	});
	if (!channel) {
		res.status(404)
			.end();
		return;
	}
	const messages = JSON.parse(channel.get("raw_messages") as string) as GETChannel;
	res.send(messages);
}
