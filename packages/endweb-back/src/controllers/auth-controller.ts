import { Request, Response } from "express";

export module AuthController {
	export function onDiscordCallback(req: Request, res: Response) {
		// res.redirect("/");
		res.send("connected");
	}
}
