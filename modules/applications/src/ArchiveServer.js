"use strict";

const express = require("express");
const fetch = require("node-fetch");
const querystring = require("querystring");
const Discord = require("discord.js");
const cookieParser = require("cookie-parser");

class ArchiveServer {
	constructor(client) {
		this.client = client;
		this.server = express();
		this.config = this.client.moduleConfig["Application System"];
		this.guild = this.client.guilds.cache.get(this.config["guild-id"]);
	}

	init() {
		this.server.use(cookieParser());
		this.server.set("view engine", "ejs");
		this.server.set("views","modules/applications/views");
		this.server.get("/login/", (req, res) => this.onLoginAttempt(req, res));
		this.server.get("/login/discord", (req, res) => this.getOauth(req, res));
		this.server.get("/apps/:identifier/", (req, res) => this.getArchive(req, res));
		this.server.use("/", express.static("modules/applications/public/"));
		this.server.listen(this.config["archive-server-port"]);
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
			let id = await this.getUserID(access_token);
			let isAuthorized = await this.hasAccessToArchive(id);
			if (!isAuthorized) {
				throw "you do not have the required permissions.";
			} else {
				await this.client.db.async_run(
					"INSERT or REPLACE INTO archived_logged_on VALUES (?, ?)",
					{ params: [ access_token, Date.now() + expires_in * 1000 ] }
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

	async getUserID(token) {
		let response = await fetch("http://discord.com/api/users/@me", {
			method: "GET",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Bearer ${token}`,
			},
		});
		return (await response.json()).id;
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
				"SELECT json_extract(messages, \"$[0].timestamp\") AS timestamp FROM archived_tickets WHERE name = ?;",
				{ params: [ identifier ] }
			);

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

				res.render("channel", { messages: messages });
			} else {
				res.redirect("?round=0");
			}
		} catch {
			res.status(404).send("404: Unable to find application.");
		}
	}

	async createMessagesList(identifier, round) {
		let messages = await this.client.db.async_get("SELECT messages FROM archived_tickets WHERE name = ? AND round = ?", {
			params: [ identifier, round ]
		});
		messages = JSON.parse(messages.messages);
		return messages;
	}
}

function toBase64(string) {
	return Buffer.from(string, "binary").toString("base64");
}

module.exports = ArchiveServer;
