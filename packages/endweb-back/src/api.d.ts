import { Schemas } from "endbot/dist/database";

export type GetAppInfo = Pick<
	Schemas.TicketAttributes,
	"round" | "status"
> & Schemas.ApplicantAttributes;
