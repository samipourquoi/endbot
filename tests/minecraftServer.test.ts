import { Message } from "discord.js";
import { MinecraftMessage } from "../src/lib/messages.js";
import { MinecraftServer } from "../src/minecraftServer.js";
import { readConfig } from "./mockHelpers.js";

describe("MinecraftServer class", () => {
    const serverConfig = readConfig().servers![0];
    const server = new MinecraftServer(serverConfig);

    it("Initializes RCON connection on connect()", () => {
        const mockConnect = jest.spyOn(server.rcon, "connect").mockImplementation();
        server.connect();
        expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("Sends a message through RCON", () => {
        const mockMessage = { content: "test" } as Message;
        jest.spyOn(MinecraftMessage, "format").mockImplementationOnce(() => {
            return "format test";
        });
        const mockSend = jest.spyOn(server.rcon, "send").mockImplementation();
        server.sendMessage(mockMessage);
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(mockSend.mock.calls[0][0]).toContain("format test");
    });
});
