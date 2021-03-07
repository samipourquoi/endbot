import { GetAppInfo } from "endweb-back/src/api";

export const ip = process.env.NODE_ENV == "development" ?
	"http://localhost:8080" :
	"";

export let token = "UJij65UJCFVsmOx1dzhDuWGPHFCZBE";

export async function getAppsInfo() {
	console.log(ip);
	const response = await fetch(`${ip}/api/private/apps/`, {
		headers: {
			"Authorization": token,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		mode: "cors"
	});
	return await response.json() as GetAppInfo[];
}
