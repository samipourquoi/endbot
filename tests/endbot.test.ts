import { Message, TextChannel } from "discord.js";
import { Bridge } from "../src/bridge.js";
import { Config } from "../src/config.js";
import { Endbot } from "../src/endbot.js";
import { readConfig } from "./mockHelpers.js";

describe("Endbot class", () => {
    const expectedConfig = readConfig();
    jest.spyOn(Config.prototype as any, "readConfigFile").mockReturnValue(expectedConfig);
    jest.spyOn(Endbot.prototype as any, "login").mockImplementation(() => Promise.resolve());

    const bot = new Endbot();

    it("Initializes all server bridges in config", () => {
        jest.spyOn(bot.channels.cache, "get").mockImplementation((channelId: string) => {
            // The Object class needs to be used because jest doesn't work well with the
            // `instanceof` operator: https://github.com/jestjs/jest/issues/2549
            const channel = Object.create(TextChannel.prototype);
            return Object.assign(channel, { id: channelId });
        });
        const mockConnect = jest.spyOn(Bridge.prototype, "connect").mockImplementation();
        (bot as any).initBridges();
        expect(mockConnect).toHaveBeenCalledTimes(2);
        expect((bot as any).bridges.length).toEqual(2);
    });

    it("Sends Discord message to Minecraft", () => {
        const mockRunCommand = jest.spyOn((bot as any).handler, "runCommand");
        const mockSend = jest
            .spyOn(bot as any, "sendMessageToMinecraft")
            .mockImplementationOnce(() => {});

        const mockMessage = { author: { bot: false }, content: "test" } as Message;

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(mockRunCommand).not.toHaveBeenCalled();
    });

    it("Runs a command with the correct prefix", () => {
        const mockRunCommand = jest
            .spyOn((bot as any).handler, "runCommand")
            .mockImplementationOnce(() => {});
        jest.spyOn(bot as any, "sendMessageToMinecraft").mockImplementationOnce(() => {});
        const mockSend = jest.fn();

        const mockMessage = {
            author: { bot: false },
            content: "!test",
            channel: { send: mockSend },
        } as unknown as Message;

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockRunCommand).toHaveBeenCalledTimes(1);
    });

    it("Does not send Discord message to Minecraft if the author is a bot", () => {
        const mockMessage = { author: { bot: true } } as Message;
        const mockSend = jest.spyOn(bot as any, "sendMessageToMinecraft");

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it("Only sends messages to Minecraft servers with the channel ID", () => {
        const mockMessage = { channelId: "2" } as Message;
        const channel1 = { id: "1" } as TextChannel;
        const channel2 = { id: "2" } as TextChannel;
        (bot as any).bridges = [
            new Bridge((bot as any).config.servers[0], channel1),
            new Bridge(((bot as any).config as any).servers[1], channel2),
        ];

        const mockSend1 = jest
            .spyOn((bot as any).bridges[0] as any, "sendToMinecraft")
            .mockImplementationOnce(() => {});
        const mockSend2 = jest
            .spyOn((bot as any).bridges[1] as any, "sendToMinecraft")
            .mockImplementationOnce(() => {});

        (bot as any).sendMessageToMinecraft(mockMessage);
        expect(mockSend1).not.toHaveBeenCalled();
        expect(mockSend2).toHaveBeenCalledTimes(1);
    });

    it("Does not extract a command when no prefix is used", () => {
        const messages = ["test message", "!"];
        for (const message of messages) {
            const result = (bot as any).extractCommand(message);
            expect(result).toEqual({ cmdName: "", args: [] });
        }
        const result = (bot as any).extractCommand("test message");
        expect(result).toEqual({ cmdName: "", args: [] });
    });

    it("Extracts a command and its arguments when a valid prefix is used", () => {
        const commands = {
            "!test arg1 arg2": { cmdName: "test", args: ["arg1", "arg2"] },
            $test: { cmdName: "test", args: [] },
        };

        for (const [message, expected] of Object.entries(commands)) {
            const result = (bot as any).extractCommand(message);
            expect(result).toEqual(expected);
        }
    });
});
