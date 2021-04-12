import * as express from "express";
import { config, instance } from "endbot";
import { routes } from "./routes";
import * as cors from "cors";
import * as passport from "passport";
import { v4 as uuid } from "uuid";
import * as session from "express-session";

export const web = express();

web.use(cors());
web.use(session({
	genid: () => uuid(),
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true
}));
web.use(passport.initialize());
web.use(passport.session());
web.use(routes);

const port = config.web?.port ||
	process.env.PORT ||
	8080;

web.listen(port, () =>
	console.log(`Web server listening to port ${port}`));
