import { getUserInfo, getUserToken, isMember } from "./discord";
import { APIUser } from "discord-api-types";

export module Auth {
	export async function login(code: string) {
		let { access_token } = await getUserToken(code as string);
		let user = await getUserInfo(access_token);
		if (!user) return null;

		if (await isMember(user.id)) {
			return {
				user,
				token: access_token,

			};
		} else {
			return null;
		}
	}
}