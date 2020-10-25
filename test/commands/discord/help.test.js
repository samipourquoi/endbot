"use strict";

const login = require("../../login");
const Help = require("../../../src/commands/discord/Help");
const Assertions = require("../Assertions");
const Command = require("../../../src/commands/Command");

describe("help command", () => {
	let channel;
	let command;
	let assert;
	let client;
	beforeAll(async () => {
		client = await login();
		let guild = client.guilds.cache.get(process.env.ENDBOT_CI_GUILD);
		channel = await guild.channels.create("help-ci");
		assert = new Assertions(client, channel);
	});

	it("should register the command", async () => {
		command = new Help(client);
		client.discordCommands[command.usage.split(" ")[0]] = command;
		expect(client.discordCommands["help"]).toBeDefined();
	});

	describe("test the command", () => {
		it("should send help pannel", async () => {
			await assert.runCommand("_help");
			expect(assert.lastEmbed()).toBeDefined();
		});

		it("should have the right title", () => {
			let embed = command.generate([ new Command(client) ]);
			expect(embed.title).toBe("Help Pannel");
		});

		it("should end with the documentation", () => {
			let embed = command.generate([ new Command(client) ]);
			expect(embed.description).toMatch(/\[Full documentation here\]\(https.+\)$/);
		});
	});

	afterAll( async () => {
		await channel.delete();
		client.destroy();
	});
});
