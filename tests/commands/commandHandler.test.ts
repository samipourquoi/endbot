import {
    CommandHandler,
    commandHandler,
    discordCommand,
} from "../../src/commands/commandHandler.js";
import { CommandNotFoundEmbed, ErrorEmbed, InvalidPermissionsEmbed } from "../../src/lib/embeds.js";
import { ICommandContext, ICommandInfo } from "../../src/lib/interfaces.js";
import { mockChannel, mockMember } from "../mockHelpers.js";
import { Command } from "../../src/commands/command.js";

const commandInfo = { name: "test" } as ICommandInfo;

describe("CommandHandler class", () => {
    let cmdContext: ICommandContext;

    beforeEach(() => {
        cmdContext = {
            cmdName: "test",
            args: [],
            author: mockMember(),
            bridges: [],
            channel: mockChannel(),
        } as ICommandContext;
    });

    it("Adds a command when addCommand() is called", async () => {
        const command = new Command(commandInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);
        expect((commandHandler as any).commands.length).toBe(1);
        expect((commandHandler as any).commands[0]).toBe(command);
    });

    it("Sends CommandNotFoundEmbed when a matching command is not found", async () => {
        const commandHandler = new CommandHandler();
        await commandHandler.handleCommand(cmdContext);

        const mockSend = cmdContext.channel.send as jest.Mock;
        expect(mockSend).toHaveBeenCalledTimes(1);

        const resultEmbed = mockSend.mock.calls[0][0]["embeds"][0];
        expect(resultEmbed).toBeInstanceOf(CommandNotFoundEmbed);
    });

    it("Sends InvalidPermissionsEmbed when author has no permission to run command", async () => {
        const cmdInfo = { name: "test", users_allowed: ["admin1234"] } as ICommandInfo;
        const command = new Command(cmdInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);

        await commandHandler.handleCommand(cmdContext);

        const mockSend = cmdContext.channel.send as jest.Mock;
        expect(mockSend).toHaveBeenCalledTimes(1);

        const resultEmbed = mockSend.mock.calls[0][0]["embeds"][0];
        expect(resultEmbed).toBeInstanceOf(InvalidPermissionsEmbed);
    });

    it("Runs command when command matches name or aliases", async () => {
        const cmdInfo = { name: "test", aliases: ["test1", "test2"] } as ICommandInfo;
        const command = new Command(cmdInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);

        const mockCmdRun = jest.spyOn(command, "run").mockImplementation();
        const commandNames = ["test", "test1", "test2"];
        for (const commandName of commandNames) {
            cmdContext.cmdName = commandName;
            await commandHandler.handleCommand(cmdContext);
        }

        expect(mockCmdRun).toHaveBeenCalledTimes(commandNames.length);
    });

    it("Sends error embed when a command has an unexpected error while running", async () => {
        const cmdInfo = { name: "test", aliases: ["test1", "test2"] } as ICommandInfo;
        const command = new Command(cmdInfo);
        const commandHandler = new CommandHandler();
        commandHandler.addCommand(command);

        jest.spyOn(command, "run").mockImplementation(() => {
            throw Error("Unexpected error");
        });
        await commandHandler.handleCommand(cmdContext);

        const mockSend = cmdContext.channel.send as jest.Mock;
        expect(mockSend).toHaveBeenCalledTimes(1);

        const resultEmbed = mockSend.mock.calls[0][0]["embeds"][0];
        expect(resultEmbed).toBeInstanceOf(ErrorEmbed);
        expect(resultEmbed.data.description.includes("Unexpected error")).toBeTruthy();
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
