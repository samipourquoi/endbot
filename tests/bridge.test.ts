import { Bridge } from "../src/bridge.js";
import { Message } from "discord.js";
import { MinecraftMessage } from "../src/lib/messages.js";
import { readConfig } from "./mockHelpers.js";

describe("Bridge class", () => {
    const serverConfig = readConfig().servers![0];
    const bridge = new Bridge(serverConfig);

    it("Initializes RCON connection on connect()", () => {
        const mockConnect = jest.spyOn(bridge.rcon, "connect").mockImplementation();
        bridge.connect();
        expect(mockConnect).toHaveBeenCalledTimes(1);
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
