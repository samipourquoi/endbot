import { Request, Response, Router } from "express";
import { IpFilter as ipfilter } from "express-ipfilter";

export const apiAppsRouter = Router();

if (process.env.ENV == "production") {
	// Only authorize Google's IPs.
	apiAppsRouter.use(ipfilter([
		[ "216.239.32.0", "216.239.63.255" ],
		[ "64.233.160.0", "64.233.191.255" ],
		[ "66.249.80.0", "66.249.95.255" ],
		[ "72.14.192.0", "72.14.255.255" ],
		[ "209.85.128.0", "209.85.255.255" ],
		[ "66.102.0.0", "66.102.15.255" ],
		[ "74.125.0.0", "74.125.255.255" ],
		[ "64.18.0.0", "64.18.15.255" ],
		[ "207.126.144.0", "207.126.159.255" ],
		[ "173.194.0.0", "173.194.255.255" ]
	], { mode: "allow" }));
}

apiAppsRouter.post("/apps", onPostApps);

function onPostApps(req: Request, res: Response) {
	res.end();
}
