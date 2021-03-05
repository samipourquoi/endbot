import { getUserInfo, getUserToken, isMember } from "./discord";
import { APIUser } from "discord-api-types";
import * as Redis from "ioredis";

export module Auth {
	const redis = new Redis({
		host: process.env.CONTAINER ?
			"redis" :
			"localhost",
		keyPrefix: "endweb:"
	});

	export async function login(discordOauthCode: string) {
		let { access_token, expires_in } = await getUserToken(discordOauthCode as string);
		let user = await getUserInfo(access_token);
		if (!user) return null;

		if (await isMember(user.id)) {
			await redis.set(
				access_token,
				JSON.stringify(user),
				"ex",
				expires_in
			);
			console.log(access_token);

			return {
				user,
				token: access_token,
			};
		} else {
			return null;
		}
	}

	export async function isLoggedIn(accessToken: string) {
		return await redis.exists(accessToken) == 1;
	}

	export async function getUserInfo(token: string) {
		const user = await redis.get(token);
		if (user == null)
			return null;
		else
			return JSON.parse(user) as APIUser;
	}
}