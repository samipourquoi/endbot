import * as querystring from "querystring";
import fetch from "node-fetch";
import {
	APIUser,
	RESTPostOAuth2AccessTokenResult,
	RESTPostOAuth2AccessTokenURLEncodedData,
	Snowflake
} from "discord-api-types";
import { ParsedUrlQueryInput } from "querystring";
import { config, instance } from "endbot";
import { Bridges } from "endbot/dist/bridge/bridge";
import instances = Bridges.instances;

export async function getUserToken(code: string):
	Promise<RESTPostOAuth2AccessTokenResult> {

	const tokenURL = "https://discord.com/api/oauth2/token";
	const queries: RESTPostOAuth2AccessTokenURLEncodedData = {
		client_id: instance.user!.id as Snowflake,
		client_secret: config.web!.client_secret as string,
		grant_type: "authorization_code",
		code,
		redirect_uri: config.web!.redirect_uri,
		scope: "identify"
	};
	const auth = Buffer
		.from(`${instance.user!.id}:${config.web!.client_secret}`,
			"binary")
		.toString("base64");

	let response = await fetch(tokenURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Basic ${auth}`,
		},
		body: querystring.stringify(queries as unknown as ParsedUrlQueryInput)
	});

	return await response.json();
}

export async function getUserInfo(token: string):
	Promise<APIUser | null> {

	let response = await fetch("https://discord.com/api/users/@me", {
		method: "GET",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${token}`,
		},
	});
	const json = await response.json();
	if (json.code == 0)
		return null;
	else
		return json;
}

export async function isMember(id: Snowflake):
	Promise<boolean> {

	let guild = await instance.guilds.fetch(instances[0].channel.guild.id);
	let member = await guild.members.fetch(id);
	return !!member.roles.cache.get(config.web!.member_role_id);
}