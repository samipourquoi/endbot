import * as express from "express";
import { AppsController } from "./controllers/apps-controller";
import { FormController } from "./controllers/form-controller";
import { authenticate } from "passport";
import { AuthController } from "./controllers/auth-controller";
import "./auth/strategies";

export const routes = express.Router()
	.use(express.urlencoded({ extended: true }))

	.post("/form",
		FormController.googleOnly,
		FormController.submit)
	.get("/apps",
		AppsController.getApps)
	.get("/apps/:id",
		AppsController.getChannel)
	.get("/auth",
		authenticate("discord", { scope: ["identify", "email"] }))
	.get("/auth/callback",
		authenticate("discord", { failureRedirect: "/" }),
		AuthController.onDiscordCallback);
