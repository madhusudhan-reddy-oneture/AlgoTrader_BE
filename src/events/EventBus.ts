import EventEmitter from "events";

export const EventBus = new EventEmitter();
EventBus.setMaxListeners(50);