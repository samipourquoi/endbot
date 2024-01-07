import { Message, TextChannel } from "discord.js";
import { mockChannel, mockMember, readConfig } from "./mockHelpers.js";
import { Bridge } from "../src/bridge.js";
import { Config } from "../src/config.js";
import { Endbot } from "../src/endbot.js";

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

    it("Does not send a Discord message to Minecraft that is invalid", () => {
        jest.spyOn(bot as any, "isInvalidMessage").mockImplementationOnce(() => {
            return true;
        });

        const mockSend = jest.spyOn(bot as any, "sendMessageToMinecraft");

        (bot as any).handleDiscordMessage({});
        expect(mockSend).not.toHaveBeenCalled();
    });

    it("Does not send a Discord message to Minecraft if no bridges are configured", () => {
        const bridges = (bot as any).bridges;
        (bot as any).bridges = [];
        jest.spyOn(bot as any, "isInvalidMessage").mockImplementationOnce(() => {
            return false;
        });

        const mockSend = jest.spyOn(bot as any, "sendMessageToMinecraft");

        (bot as any).handleDiscordMessage({});
        expect(mockSend).not.toHaveBeenCalled();

        (bot as any).bridges = bridges; // Restore
    });

    it("Sends Discord message to Minecraft", () => {
        jest.spyOn(bot as any, "isInvalidMessage").mockImplementationOnce(() => {
            return false;
        });

        const mockRunCommand = jest.spyOn((bot as any).handler, "handleCommand");
        const mockSend = jest
            .spyOn(bot as any, "sendMessageToMinecraft")
            .mockImplementationOnce(() => {});

        const mockMessage = { author: { bot: false }, content: "test" } as Message;

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(mockRunCommand).not.toHaveBeenCalled();
    });

    it("Runs a command with the correct prefix", () => {
        jest.spyOn(bot as any, "isInvalidMessage").mockImplementationOnce(() => {
            return false;
        });

        const mockRunCommand = jest
            .spyOn((bot as any).handler, "handleCommand")
            .mockImplementationOnce(() => {});
        jest.spyOn(bot as any, "sendMessageToMinecraft").mockImplementationOnce(() => {});

        const mockMessage = {
            author: { bot: false },
            content: "!test",
            channel: {},
            member: {},
        } as unknown as Message;

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockRunCommand).toHaveBeenCalledTimes(1);
    });

    it("Recognizes invalid Discord messages", () => {
        const messages = [
            { author: { bot: true }, member: mockMember(), channel: mockChannel() },
            { author: { bot: false }, member: null, channel: mockChannel() },
            { author: { bot: false }, member: mockMember(), channel: null },
        ];
        for (const message of messages) {
            const isInvalid = (bot as any).isInvalidMessage(message);
            expect(isInvalid).toBeTruthy();
        }
    });

    it("Only sends messages to Minecraft servers with the channel ID", () => {
        const mockMessage = { channelId: "2" } as Message;
        const channel1 = { id: "1" } as TextChannel;
        const channel2 = { id: "2" } as TextChannel;
        (bot as any).bridges = [
            new Bridge((bot as any).config.servers[0], channel1),
            new Bridge((bot as any).config.servers[1], channel2),
        ];

        const mockSend1 = jest.spyOn((bot as any).bridges[0] as any, "sendToMinecraft");
        const mockSend2 = jest
            .spyOn((bot as any).bridges[1] as any, "sendToMinecraft")
            .mockImplementationOnce(() => {});

        (bot as any).sendMessageToMinecraft(mockMessage);
        expect(mockSend1).not.toHaveBeenCalled();
        expect(mockSend2).toHaveBeenCalledTimes(1);
    });
});
