import { CommandHandler, commandHandler, discordCommand } from "../../src/command-handler.js";
import { Command } from "../../src/lib/command.js";
import { ICommandInfo } from "../../src/interfaces.js";

const commandInfo = {} as ICommandInfo;

describe("CommandHandler class", () => {
	it("adds a command when addCommand() is called", async () => {
		const command = new Command(commandInfo);
		const commandHandler = new CommandHandler();
		commandHandler.addCommand(command);
		expect(commandHandler.commands.length).toBe(1);
		expect(commandHandler.commands[0]).toBe(command);
	});
});

describe("discordCommand class decorator", () => {
	// This is needed to mock a class that the decorator uses as an argument
	class Test extends Command {
		constructor() {
			super(commandInfo);
		}
	}

	it("calls addCommand() when run", async () => {
		const addCommand = jest.spyOn(commandHandler, "addCommand");
		discordCommand(Test);
		expect(addCommand).toHaveBeenCalledTimes(1);
	});
});
