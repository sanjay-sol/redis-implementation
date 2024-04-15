import * as net from "net";
import { PubSub } from "./pubSub";

const pubSub = new PubSub();

export function handleSubscribe(reply: any, socket: net.Socket) {
  const channels = reply.slice(1);
  pubSub.subscribe(channels, socket);
}

export function handlePublish(reply: any, socket: net.Socket) {
  const [_, channel, message] = reply;
  const result = pubSub.publish(channel, message);
  if (result) {
    socket.write(":1\r\n");
  } else {
    socket.write(":0\r\n");
  }
}
