import { Router } from "express";

export const router = Router()
	.use("/api", require("./api"))
	.use("/login", require("./login"));
