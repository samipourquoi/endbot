import { GETAppInfo, GETChannel } from "endweb-back/src/api";

export const ip = process.env.NODE_ENV == "development" ?
	"http://localhost:8080" :
	"";

export let token = "UJij65UJCFVsmOx1dzhDuWGPHFCZBE";

function bonkfetch(uri: string) {
	return fetch(`${ip}${uri}`, {
		headers: {
			"Authorization": token,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		mode: "cors"
	});
}

export async function getAppsInfo() {
	const response = await bonkfetch("/api/private/apps");
	return await response.json() as GETAppInfo[];
}

export async function getChannel(id: string) {
	console.log(id);
	const response = await bonkfetch(`/api/private/apps/${id}`);
	return await response.json() as GETChannel;
}
