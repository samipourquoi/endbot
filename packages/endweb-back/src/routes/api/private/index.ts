import { Router } from "express";

module.exports = Router()
	.use("/form", require("./form"))
	.use("/apps", require("./apps"))