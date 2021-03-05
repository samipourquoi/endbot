import * as express from "express";

module.exports = express.Router()
	.use(express.urlencoded({ extended: true }))
	.use("/private", require("./private"))
	.use("/form", require("./form"));
