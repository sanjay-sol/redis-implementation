export class Susbscribable {
    events: { [key: string]: Function[] } = {};

    on(event: string, callback: Function) {
        if (!this.events[event]) {
        this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event: string, ...args: any[]) {
        if (this.events[event]) {
        this.events[event].forEach((callback) => {
            callback(...args);
        });
        }
    }
}

export class PubSub extends Susbscribable {
    publish(event: string, ...args: any[]) {
        this.emit(event, ...args);
    }
}

export class Redis extends PubSub {
    mem: Map<string, any> = new Map();
    constructor() {
        super();
        this.on("set", (key: string, value: any) => {
        this.mem.set(key, value);
        });
        this.on("get", (key: string) => {
        this.publish("response", this.mem.get(key));
        });
    }
}

export class Susbscribable2<MessagingType> {
  private subscribers: Set<(msg: MessagingType) => void> = new Set();
  constructor() {}
  subscribe(cb: (msg: MessagingType) => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }
  publish(msg: MessagingType): void {
    this.subscribers.forEach((cb) => cb(msg));
  }
}
