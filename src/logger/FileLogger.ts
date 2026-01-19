import fs from 'fs';
import { Logger } from "./Logger"
import path from 'path';

export class FileLogger<T> implements Logger<T>{
    private stream: fs.WriteStream;

    constructor(filename: string) {
        const logDir = path.join(__dirname, "../../logs");
        fs.mkdirSync(logDir, { recursive: true });

        const filePath = path.join(logDir, filename);
        this.stream = fs.createWriteStream(filePath, { flags: "a" });
    }

    public log(event: T): void {
        this.stream.write(JSON.stringify(event) + "\n");
    }

    public close(): void {
        this.stream.end();
    }
}