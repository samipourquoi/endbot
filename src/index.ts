import { Endbot } from "./endbot";
import * as dotenv from "dotenv";
dotenv.config({
	path: process.env.PROD ?
		".env" :
		".env.dev"
});

export const instance = new Endbot();

instance.login(process.env.TOKEN);
