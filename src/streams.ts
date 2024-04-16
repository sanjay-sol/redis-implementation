interface Stream {
  name: string;
  elements: Map<string, Record<string, string>>;
}

export class StreamManager {
  streams: Map<string, Stream>;

  constructor() {
    this.streams = new Map();
  }

  xadd(streamName: string, fields: Record<string, string | number>) {
    const stream = this.streams.get(streamName) || {
      name: streamName,
      elements: new Map(),
    };
    const id = (Date.now() + Math.random()).toString();
    stream.elements.set(id, fields);
    this.streams.set(streamName, stream);
    return id;
  }
}
