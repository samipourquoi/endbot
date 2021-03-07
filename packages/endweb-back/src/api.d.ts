import { Schemas } from "endbot/dist/database";

export type GETAppInfo = Omit<
	Schemas.TicketAttributes,
	"raw_messages"
> & Schemas.ApplicantAttributes;

export type GETChannel = object[];
