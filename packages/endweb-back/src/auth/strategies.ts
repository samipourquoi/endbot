import * as passport from "passport";
import { Profile, Strategy as DiscordStrategy } from "passport-discord";
import { config, instance } from "endbot";
import { Bridges } from "endbot/dist/bridge/bridge";
import { Snowflake } from "discord.js";

declare global {
	module Express {
		interface User extends Profile {}
	}
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj as Express.User));

passport.use(new DiscordStrategy({
	clientID: instance.user!.id,
	clientSecret: config.client_secret,
	callbackURL: config.web!.redirect_uri,
	scope: ["identify", "email"],
}, async (accessToken, refreshToken, profile, cb) => {
	if (await isMember(profile.id))
		cb(null, profile);
	else
		cb();
}));

async function isMember(id: Snowflake):
	Promise<boolean>
{
	let guild = await instance.guilds.fetch(Bridges.instances[0].channel.guild.id);
	let member = await guild.members.fetch(id);
	return !!member.roles.cache.get(config.web!.member_role_id);
}
