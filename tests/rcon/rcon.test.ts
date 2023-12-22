import { Buffer } from "buffer";
import { Rcon } from "../../src/lib/rcon/rcon.js";
import net from "net";
import { readConfig } from "../config.test.js";

jest.mock("net");

describe("RCON class", () => {
    // Disable logging to the console while running these tests
    jest.spyOn(console, "log").mockImplementation();

    // Don't actually run setTimeout()'s timer to not slow down the test
    jest.useFakeTimers();

    let rcon: Rcon;

    const server = readConfig().servers![0];
    (net as any).connect.mockReturnValue(new net.Socket());

    it("sets the connection on initialization", async () => {
        const mockConnect = jest.spyOn(Rcon.prototype as any, "connect");
        rcon = new Rcon(server);

        expect(rcon["server"]).toBe(server);
        expect(rcon["queue"]).toBeDefined();
        expect(rcon["socket"]).toBeDefined();
        expect(mockConnect).toHaveBeenCalled();

        // Check if event emitters have been set up correctly
        expect(rcon["socket"].once).toBeCalledWith("connect", expect.any(Function));
        expect(rcon["socket"].once).toBeCalledWith("end", expect.any(Function));
        expect(rcon["socket"].on).toBeCalledWith("error", expect.any(Function));
    });

    it("sets up a connection when calling connect()", async () => {
        const mockNetConnect = jest.spyOn(net, "connect");
        await rcon.connect();

        expect(mockNetConnect).toHaveBeenCalledWith(server.rcon_port, server.host);
    });

    it("sends an authentication packet when trying to authenticate", async () => {
        const mockSend = jest.spyOn(Rcon.prototype as any, "send").mockImplementationOnce(() => {});
        await (rcon as any).auth();

        expect(mockSend).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Connected"));
    });

    it("catches the error if authentication fails", async () => {
        const mockSend = jest.spyOn(Rcon.prototype as any, "send").mockImplementationOnce(() => {
            throw new Error();
        });
        await (rcon as any).auth();

        expect(mockSend).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Failed to connect"));
    });

    it("sends a message to the console when disconnected", async () => {
        await (rcon as any).end();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Disconnected"));
    });

    // TODO: Find a way to test code inside the event emitters
    // I'm not sure how feasible that is, but it would be nice to have those tests
    it("adds a request to the queue when sending a packet", async () => {
        // Checks if the response from queue.add() is returned
        jest.spyOn(rcon["queue"] as any, "add").mockImplementationOnce(() => {
            return null;
        });
        const response = await rcon.send("test");

        expect(response).toBe(null);
    });

    it("sends an empty packet when listening for multiple packets", async () => {
        const mockSocketOn = jest.spyOn(rcon["socket"], "on");
        const mockSocketWrite = jest.spyOn(rcon["socket"], "write");
        (rcon as any).listenForMultiplePackets(Buffer.alloc(0));

        // Only expect it to be called after the timer has finished
        expect(mockSocketWrite).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);

        expect(mockSocketOn).toHaveBeenCalledTimes(1);
        expect(await mockSocketWrite).toHaveBeenCalledTimes(1);
    });
});
