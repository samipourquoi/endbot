import { QueueItem } from "../interfaces.js";

// The following code is from the queue implemented by
// https://github.com/janispritzkau/rcon-client
export class Queue {
    private queue: QueueItem[] = [];
    private draining = false;

    async add(getData: () => Promise<string>): Promise<string> {
        return new Promise((resolve, reject) => {
            this.queue.push({ getData, resolve, reject });
            this.drain();
        });
    }

    private async drain(): Promise<void> {
        if (this.draining) return;

        const request = this.queue.shift();
        if (!request) return;

        this.draining = true;

        try {
            const data = await request.getData();
            request.resolve(data);
        } catch (error) {
            request.reject(error);
        } finally {
            this.draining = false;
            this.drain();
        }
    }
}
