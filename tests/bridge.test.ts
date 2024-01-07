import { mockChannel, readConfig } from "./mockHelpers.js";
import { Bridge } from "../src/bridge.js";
import { Message } from "discord.js";
import { MinecraftMessage } from "../src/lib/messages.js";
import { Tail } from "tail";
import fs from "fs";

jest.mock("tail");

describe("Bridge class", () => {
    // Disable logging errors to the console while running these tests
    jest.spyOn(console, "error").mockImplementation();

    const serverConfig = readConfig().servers![0];
    const bridge = new Bridge(serverConfig, mockChannel());

    it("Initializes RCON connection and tail on connect()", () => {
        const mockConnect = jest.spyOn((bridge as any).rcon, "connect").mockImplementation();
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

    it("Does not send a message to Discord if the content is filtered out", async () => {
        await bridge.sendToDiscord("not matching");
        expect(bridge.channel.send).not.toHaveBeenCalled();
    });

    it("Sends a message to Discord that matches the desired content", async () => {
        await bridge.sendToDiscord("[00:00:00] [Server thread/INFO]: <Bob> hi");
        expect(bridge.channel.send).toHaveBeenCalledTimes(1);
    });

    it("Sends a message to Minecraft server through RCON", async () => {
        const mockMessage = { content: "test" } as Message;
        jest.spyOn(MinecraftMessage, "format").mockImplementationOnce(() => {
            return "format test";
        });
        const mockSend = jest.spyOn((bridge as any).rcon, "send").mockImplementationOnce(() => {});
        await bridge.sendToMinecraft(mockMessage);
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(mockSend.mock.calls[0][0]).toContain("format test");
    });

    it("Sends a command to Minecraft server and returns result", async () => {
        const mockSend = jest.spyOn((bridge as any).rcon, "send").mockImplementationOnce(() => {
            return "command result";
        });
        const cmdResult = await bridge.sendMinecraftCommand("command");
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(cmdResult).toEqual("command result");
    });

    it("Catches errors when sending a command to Minecraft server", async () => {
        jest.spyOn((bridge as any).rcon, "send").mockImplementationOnce(() => {
            throw Error();
        });
        expect(await bridge.sendMinecraftCommand("error command")).toEqual("");
    });
});
