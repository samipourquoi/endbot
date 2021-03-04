import * as express from "express";

export const apiRouter = express.Router()
	.use(express.urlencoded({ extended: true }))
	.use("/private", require("./private"));
