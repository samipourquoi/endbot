import { Message, TextChannel } from "discord.js";
import { Bridge } from "../src/bridge.js";
import { MinecraftMessage } from "../src/lib/messages.js";
import { Tail } from "tail";
import fs from "fs";
import { readConfig } from "./mockHelpers.js";

jest.mock("tail");

describe("Bridge class", () => {
    // Disable logging errors to the console while running these tests
    jest.spyOn(console, "error").mockImplementation();

    const serverConfig = readConfig().servers![0];
    const bridge = new Bridge(serverConfig, {} as TextChannel);

    it("Initializes RCON connection and tail on connect()", () => {
        const mockConnect = jest.spyOn(bridge.rcon, "connect").mockImplementation();
        const mockInitTail = jest.spyOn(bridge as any, "initTail").mockImplementationOnce(() => {});
        bridge.connect();
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(mockInitTail).toHaveBeenCalledTimes(1);
    });

    it("Skips initializing the tail when the server's log file doesn't exist", () => {
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => {
            return false;
        });

        (bridge as any).initTail();
        expect(Tail).not.toHaveBeenCalled();
    });

    it("Initializes a tail when the server's log file is found", () => {
        jest.spyOn(fs, "existsSync").mockImplementationOnce(() => {
            return true;
        });

        (bridge as any).initTail();
        expect(Tail).toHaveBeenCalledTimes(1);
    });

    it("Sends a message to Minecraft server through RCON", () => {
        const mockMessage = { content: "test" } as Message;
        jest.spyOn(MinecraftMessage, "format").mockImplementationOnce(() => {
            return "format test";
        });
        const mockSend = jest.spyOn(bridge.rcon, "send").mockImplementation();
        bridge.sendToMinecraft(mockMessage);
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(mockSend.mock.calls[0][0]).toContain("format test");
    });
});
