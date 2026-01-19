import { error } from "console";

type AsyncTask = () => Promise<void>;

export class EventQueue{
    private queue: AsyncTask[] = [];
    private processing = false;

    public enqueue(task: AsyncTask): void {
        this.queue.push(task);
        this.process();
    }

    private async process(): Promise<void>{
        if (this.processing) {
            return;
        }
        this.processing = true;
        
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            try {
                await task?.();
            }
            catch (err) {
                console.error("DB Task has failed", err);
            }
        }

        this.processing = false;
    }
}