import { Queue } from "../../src/lib/rcon/queue.js";

describe("Queue class", () => {
    let queue: Queue;

    const testFunction = (): Promise<string> => {
        return new Promise((resolve) => {
            resolve("test");
        });
    };

    beforeEach(() => {
        queue = new Queue();
    });

    it("adds a packet to the queue", async () => {
        const mockDrain = jest.spyOn(Queue.prototype as any, "drain").mockImplementationOnce(() => {
            const test = queue["queue"][0];
            test.resolve("test");
        });

        const promise = queue.add(testFunction);

        expect(queue["queue"].length).toBe(1);
        expect(promise).resolves.toBe("test");
        expect(mockDrain).toHaveBeenCalledTimes(1);
    });

    it("drains packets in the queue in succession", async () => {
        const mockDrain = jest.spyOn(Queue.prototype as any, "drain");
        new Promise((resolve, reject) => {
            queue["queue"].push({ getData: testFunction, resolve, reject });
        });

        const mockResolve = jest.spyOn(queue["queue"][0], "resolve");
        await (queue as any).drain();

        // Since drain() works recursively, it should be called two times
        // if one packet is added to the queue
        expect(mockDrain).toHaveBeenCalledTimes(2);
        expect(mockResolve).toHaveBeenCalled();
        expect(queue["queue"].length).toBe(0);
    });

    it("rejects a packet if an error occurs while draining", async () => {
        new Promise((resolve, reject) => {
            queue["queue"].push({ getData: testFunction, resolve, reject });
        });

        const mockData = jest.spyOn(queue["queue"][0], "getData").mockImplementationOnce(() => {
            throw new Error();
        });

        const mockReject = jest.spyOn(queue["queue"][0], "reject").mockImplementationOnce(() => {});
        await (queue as any).drain();

        expect(mockData).toHaveBeenCalled();
        expect(mockReject).toHaveBeenCalled();
        expect(queue["queue"].length).toBe(0);
    });

    it("doesn't try to drain the queue if the queue is currently being drained", async () => {
        // Add a packet to the queue
        new Promise((resolve, reject) => {
            queue["queue"].push({ getData: testFunction, resolve, reject });
        });

        const mockDrain = jest.spyOn(Queue.prototype as any, "drain");
        queue["draining"] = true;
        await (queue as any).drain();

        expect(mockDrain).toHaveBeenCalledTimes(1);
    });
});
