"use strict";

const express = require("express");
const fetch = require("node-fetch");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const { getFormattedDate } = require("@util/embeds");

class Archive {
	constructor(client) {
		this.client = client;
		this.app = express();
		this.config = this.client.moduleConfig["Application System"];
		this.guild = this.client.guilds.cache.get(this.config["guild-id"]);
	}

	init() {
		this.app.use(cookieParser());
		this.app.set("view engine", "ejs");
		this.app.set("views","modules/applications/views");

		// Routes
		this.app.get("/login/", (req, res) => this.onLoginAttempt(req, res));
		this.app.get("/login/discord/", (req, res) => this.getOauth(req, res));
		this.app.get("/disconnect", (req, res) => this.onDisconnectAttempt(req, res));
		this.app.get("/apps/*", async (req, res, next) => {
			if (!await this.isLoggedOn(req.cookies.token)) {
				res.redirect("/login/");
			} else {
				next();
			}
		});
		this.app.get("/apps/:identifier/", (req, res) => this.getArchive(req, res));
		this.app.get("/apps/", (req, res) => this.getHomepage(req, res));
		this.app.get("/", (req, res) => res.redirect("/apps/"));
		this.app.use("/", express.static("modules/applications/public/"));

		this.app.listen(this.config["archive-server-port"]);
	}

	async onDisconnectAttempt(req, res) {
		await this.client.db.async_run(
			"DELETE FROM archived_logged_on WHERE token = ?",
			{ params: req.cookies.token }
		);
		res.clearCookie("token");
		res.redirect("/login/");
	}

	async onLoginAttempt(req, res) {
		// Redirects to `/apps` if already log on
		if (await this.isLoggedOn(req.cookies.token)) {
			res.redirect("/apps/");
		} else {
			res.redirect(this.config["oauth2-url"]);
		}
	}

	async isLoggedOn(token) {
		// Checks if the token is correct and the session hasn't expired
		let loggedOn = await this.client.db.async_get(
			"SELECT * FROM archived_logged_on WHERE token = ? AND expires_in >= ?;",
			{ params: [ token, Date.now() ] }
		);
		return loggedOn != undefined;
	}

	async getOauth(req, res) {
		try {
			let { access_token, expires_in } = await this.getInfo(req.query.code);
			let { id, avatar } = await this.getUserInfo(access_token);
			let isAuthorized = await this.hasAccessToArchive(id);
			if (!isAuthorized) {
				throw "you do not have the required permissions.";
			} else {
				await this.client.db.async_run(
					"INSERT or REPLACE INTO archived_logged_on VALUES (?, ?, ?)", {
						params: [ access_token, Date.now() + expires_in * 1000, `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` ]
					}
				);
				res.cookie("token", access_token);
				res.redirect("/apps/");
			}
		} catch (e) {
			res.status(401).send({
				status: 401,
				error: "Can't authorize user: " + e
			});
		}
	}

	async getInfo(code) {
		const tokenURL = "https://discord.com/api/oauth2/token";
		const queries = querystring.encode({
			code: code,
			client_id: this.client.user.id,
			client_secret: this.client.clientSecret,
			grant_type: "authorization_code",
			redirect_uri: this.config["redirect-uri"],
			scope: "identify"
		});
		const auth = toBase64(`${this.client.user.id}:${this.client.clientSecret}`);

		let response = await fetch(tokenURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${auth}`,
			},
			body: queries
		});

		return await response.json();
	}

	async getUserInfo(token) {
		let response = await fetch("http://discord.com/api/users/@me", {
			method: "GET",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Bearer ${token}`,
			},
		});
		return await response.json();
	}

	async hasAccessToArchive(id) {
		let member = await this.guild.members.fetch(id);
		return member.roles.cache.has(this.config["voting-role"]);
	}

	async getArchive(req, res) {
		// TODO: Make archive request work with either name or ID
		let identifier = req.params.identifier;

		try {
			// Selects the timestamp of the first message, in each of
			// the applicant's tickets.
			let timestamps = await this.client.db.async_all(
				"SELECT strftime('%d/%m/%Y', date/1000, 'unixepoch') FROM apps WHERE username = ?",
				{ params: [ identifier ] }
			);
			let user = await this.client.db.async_get("SELECT * FROM archived_logged_on WHERE token = ?", { params: [ req.cookies.token ] });

			// If the person has applied more than once and there are no
			// queries for which round to get, it will send a page with the
			// list of links to all of their tickets.
			// If there is a 'round' specified it will get that one.
			// Otherwise, it will redirect to their first (and only) ticket.
			if (timestamps.length > 1 && !req.query.round) {
				res.render("rounds", { name: identifier, tickets: timestamps });
			} else if (req.query.round) {
				let messages;
				let round = req.query.round ? parseInt(req.query.round) : 0;
				messages = await this.createMessagesList(identifier, round);

				res.render("channel", { messages: messages, userpfp: user.pfp });
			} else {
				res.redirect("?round=0");
			}
		} catch {
			res.status(404).send("404: Unable to find application.");
		}
	}

	async getHomepage(req, res) {
		let { pfp } = await this.client.db.async_get("SELECT pfp FROM archived_logged_on WHERE token = ?", { params: [ req.cookies.token ] });
		res.render("home", {
			userpfp: pfp,
			applications: await this.getApplicants()
		});
	}

	async getApplicants() {
		let archived = [];
		for (let ticket of await this.client.db.async_all("SELECT * FROM apps;")) {
			archived.push({
				status: ticket.status,
				link: `${ticket.username}?round=${ticket.round}`,
				pfp: ticket.avatar || "/assets/default-avatar.png",
				name: ticket.username,
				discriminator: ticket.discriminator,
				date: getFormattedDate(ticket.date),
				round: ticket.round
			});
		}

		return archived.reverse();
	}

	async createMessagesList(identifier, round) {
		let messages = await this.client.db.async_get("SELECT messages FROM apps WHERE username = ? AND round = ?", {
			params: [ identifier, round ]
		});
		messages = JSON.parse(messages.messages);
		return messages;
	}
}

function toBase64(string) {
	return Buffer.from(string, "binary").toString("base64");
}

module.exports = Archive;
