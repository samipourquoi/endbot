import { Schemas } from "endbot/dist/database";
import { ArchiveMessage } from "endbot/dist/structures/archive";

export type GETAppInfo = Schemas.TicketAttributes & Schemas.ApplicantAttributes;

export type GETChannel = ArchiveMessage[];
