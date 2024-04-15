import * as net from "net";
interface Subscription {
  channel: string;
  subscribers: net.Socket[];
}

function createSubscription(channel: string): Subscription {
  return { channel, subscribers: [] };
}

function addSubscriber(
  subscription: Subscription,
  socket: net.Socket
): Subscription {
  return {
    ...subscription,
    subscribers: [...subscription.subscribers, socket],
  };
}

function publishMessage(subscription: Subscription, message: string) {
  subscription.subscribers.forEach((subscriber) => {
    subscriber.write(
      `*3\r\n$7\r\nmessage\r\n$${subscription.channel.length}\r\n${subscription.channel}\r\n$${message.length}\r\n${message}\r\n`
    );
  });
}

export class PubSub {
  subscriptions: Map<string, Subscription>;

  constructor() {
    this.subscriptions = new Map();
  }

  subscribe(channels: string[], socket: net.Socket) {
    channels.forEach((channel) => {
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, createSubscription(channel));
      }
      this.subscriptions.set(
        channel,
        addSubscriber(this.subscriptions.get(channel)!, socket)
      );

      socket.write(
        `*3\r\n$9\r\nsubscribe\r\n$${channel.length}\r\n${channel}\r\n:${
          this.subscriptions.get(channel)?.subscribers.length
        }\r\n`
      );
    });
  }

  publish(channel: string, message: string): boolean {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      publishMessage(subscription, message);
      return true; 
    } else {
      return false;
    }
  }
}
