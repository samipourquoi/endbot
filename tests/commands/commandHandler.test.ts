import { CommandHandler, commandHandler, discordCommand } from "../../src/commandHandler.js";
import { CommandNotFoundEmbed, InvalidPermissionsEmbed } from "../../src/lib/embeds.js";
import { EmbedBuilder, GuildMember } from "discord.js";
import { Command } from "../../src/lib/command.js";
import { ICommandInfo } from "../../src/interfaces.js";
import { mockMember } from "../mockHelpers.js";

const commandInfo = { name: "test" } as ICommandInfo;

describe("CommandHandler class", () => {
    const member = mockMember() as unknown as GuildMember;

    it("Adds a command when addCommand() is called", async () => {
        const command = new Command(commandInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);
        expect((commandHandler as any).commands.length).toBe(1);
        expect((commandHandler as any).commands[0]).toBe(command);
    });

    it("Returns CommandNotFoundEmbed when a matching command is not found", async () => {
        const commandHandler = new CommandHandler();
        const resultEmbed = await commandHandler.runCommand("test", [], member);
        expect(resultEmbed).toBeInstanceOf(CommandNotFoundEmbed);
    });

    it("Returns InvalidPermissionsEmbed when author has no permission to run command", async () => {
        const cmdInfo = { name: "test", users_allowed: ["admin1234"] } as ICommandInfo;
        const command = new Command(cmdInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);

        const resultEmbed = await commandHandler.runCommand("test", [], member);
        expect(resultEmbed).toBeInstanceOf(InvalidPermissionsEmbed);
    });

    it("Returns result of command when command matches name or aliases", async () => {
        const cmdInfo = { name: "test", aliases: ["test1", "test2"] } as ICommandInfo;
        const command = new Command(cmdInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);

        const expectedEmbed = new EmbedBuilder().setTitle("Test Embed");
        jest.spyOn(command, "run").mockResolvedValue(expectedEmbed);

        const commandNames = ["test", "test1", "test2"];
        for (const commandName of commandNames) {
            const resultEmbed = await commandHandler.runCommand(commandName, [], member);
            expect(resultEmbed).toEqual(expectedEmbed);
        }
    });
});

describe("discordCommand class decorator", () => {
    // This is needed to mock a class that the decorator uses as an argument
    class Test extends Command {
        constructor() {
            super(commandInfo);
        }
    }

    it("Calls addCommand() when run", async () => {
        const addCommand = jest.spyOn(commandHandler, "addCommand");
        discordCommand(Test);
        expect(addCommand).toHaveBeenCalledTimes(1);
    });
});
