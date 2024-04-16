// pubSub.ts

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
    console.log("channels", channels);
    channels.forEach((channel) => {
      console.log("subscriptions11", this.subscriptions);
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, createSubscription(channel));
      }
      console.log("subscriptions12", this.subscriptions);
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
  psubscribe(patterns: string[], socket: net.Socket) {
    patterns.forEach((pattern) => {
      if (!this.subscriptions.has(pattern)) {
        this.subscriptions.set(pattern, createSubscription(pattern));
      }
      const matchingSubscriptions = Array.from(
        this.subscriptions.values()
      ).filter((subscription) =>
        this.privateMatchPattern(subscription.channel, pattern)
      );

      console.log("matchingSubscriptions", matchingSubscriptions);
      matchingSubscriptions.forEach((subscription) => {
        this.subscriptions.set(
          subscription.channel,
          addSubscriber(subscription, socket)
        );

        const message = `*4\r\n$10\r\npsubscribe\r\n$${pattern.length}\r\n${pattern}\r\n$0\r\n\r\n:${subscription.subscribers.length}\r\n`;

        socket.write(message);
      });

      matchingSubscriptions
        .filter((subscription) => !this.subscriptions.has(subscription.channel))
        .forEach((subscription) => {
          this.subscriptions.set(subscription.channel, subscription);
        });
    });
  }

  privateMatchPattern(channel: string, pattern: string) {
    const firstPart = pattern.split("*")[0];
    const secondPart = pattern.split("*")[1];
    if (channel.startsWith(firstPart) && channel.endsWith(secondPart)) {
      return true || channel == pattern;
    }
    return false;
  }

  publish(channel: string, message: string): boolean {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      publishMessage(subscription, message);
      return true;
    }
    return false;
  }
}
