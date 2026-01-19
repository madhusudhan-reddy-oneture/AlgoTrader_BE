export interface Logger<T> {
    log(event: T): void;
    close(): void;
  }
  