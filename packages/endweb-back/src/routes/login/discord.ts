import { Request, Response, Router } from "express";
import { getUserInfo, getUserToken, isMember } from "../../auth/discord";
import { Auth } from "../../auth";

module.exports = Router()
	.get("/", get);

async function get(req: Request, res: Response) {
	try {
		const { user, token } = await Auth.login(req.query.code as string) ?? {};
		if (!user)
			throw "not a member";

		res.cookie("token", token);
		res.send("logged on");
	} catch (e) {
		console.error(e);
		res.clearCookie("token");
		// res.redirect("/");
		res.send("no");
	}
}