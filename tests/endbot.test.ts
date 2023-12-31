import { Bridge } from "../src/bridge.js";
import { Config } from "../src/config.js";
import { Endbot } from "../src/endbot.js";
import { Message } from "discord.js";
import { readConfig } from "./mockHelpers.js";

describe("Endbot class", () => {
    const expectedConfig = readConfig();
    jest.spyOn(Config.prototype as any, "readConfigFile").mockReturnValue(expectedConfig);
    jest.spyOn(Endbot.prototype as any, "login").mockImplementation(() => Promise.resolve());

    const bot = new Endbot();

    it("Initializes all server bridges in config", () => {
        const mockConnect = jest.spyOn(Bridge.prototype, "connect").mockImplementation();
        (bot as any).initBridges();
        expect(mockConnect).toHaveBeenCalledTimes(2);
        expect(bot.bridges.length).toEqual(2);
    });

    it("Sends Discord message to Minecraft", () => {
        // Don't print to the console
        jest.spyOn(console, "log").mockImplementationOnce(() => {});

        const mockMessage = { author: { bot: false } } as Message;
        const mockSend = jest
            .spyOn(bot as any, "sendMessageToMinecraft")
            .mockImplementationOnce(() => {});

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("Does not send Discord message to Minecraft if the author is a bot", () => {
        const mockMessage = { author: { bot: true } } as Message;
        const mockSend = jest.spyOn(bot as any, "sendMessageToMinecraft");

        (bot as any).handleDiscordMessage(mockMessage);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it("Only sends messages to Minecraft servers with the channel ID", () => {
        const mockMessage = { channelId: "2" } as Message;
        bot.bridges = [new Bridge(bot.config.servers[0]), new Bridge(bot.config.servers[1])];

        const mockSend1 = jest
            .spyOn(bot.bridges[0] as any, "sendToMinecraft")
            .mockImplementationOnce(() => {});
        const mockSend2 = jest
            .spyOn(bot.bridges[1] as any, "sendToMinecraft")
            .mockImplementationOnce(() => {});

        (bot as any).sendMessageToMinecraft(mockMessage);
        expect(mockSend1).not.toHaveBeenCalled();
        expect(mockSend2).toHaveBeenCalledTimes(1);
    });
});
