import * as express from "express";
import { apiAppsRouter } from "./apps";

export const apiRouter = express.Router();

apiRouter.use(express.urlencoded({ extended: true }));

apiRouter.use(apiAppsRouter);

