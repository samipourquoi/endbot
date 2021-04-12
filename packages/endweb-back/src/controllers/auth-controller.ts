import { Request, Response } from "express";

export module AuthController {
	export function onDiscordCallback(req: Request, res: Response) {
		// res.redirect("/");
		res.send("connected");
	}

	export function logout(req: Request, res: Response) {
		req.logout();
		res.redirect("/");
	}
}
