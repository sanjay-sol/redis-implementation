import * as net from "node:net";
import Parser from "redis-parser";
import { handleSubscribe, handlePublish } from "./pubSubFunctions";

import {
  handleSet,
  handleGet,
  handleMGet,
  handleSetNX,
} from "./stringFunctions";
import {
  handleLPush,
  handleRPush,
  handleLPop,
  handleRPop,
  handleLRange,
  handleLLen,
  handleBRpop,
  handleBLpop,
} from "./listFunctions";
import {
  handleSADD,
  handleSREM,
  handleSISMEMBER,
  handleSINTER,
} from "./setFunctions";

const mem = new Map<string, any>();

const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log("Client connected...");

  connection.on("data", (data: Buffer) => {
    const parser = new Parser({
      returnReply: (reply: any) => {
        console.log("reply-->", reply);
        const type = reply[0].toLowerCase();
        const commandHandlers: Record<string, Function> = {
          ping: handlePing,
          //?set
          set: handleSet,
          get: handleGet,
          mget: handleMGet,
          setnx: handleSetNX,

          //?list
          lpush: handleLPush,
          rpush: handleRPush,
          lpop: handleLPop,
          rpop: handleRPop,
          lrange: handleLRange,
          llen: handleLLen,
          brpop: handleBRpop,
          blpop: handleBLpop,

          //?set
          sadd: handleSADD,
          srem: handleSREM,
          sismember: handleSISMEMBER,
          sinter: handleSINTER,

          //?pubsub
          subscribe: handleSubscribe,
          publish: handlePublish,
        };

        const handler = commandHandlers[type];
        if (handler) {
          handler(reply, connection, mem);
        } else {
          const allCommands = Object.keys(commandHandlers).join(",");
          connection.write(
            `-Error unknown command. Valid Commands-${allCommands}\r\n`
          );
        }
      },
      returnError: (err: Error) => {
        console.error("error-->", err);
      },
    });
    parser.execute(data);
  });
});

server.listen(8000, () => {
  console.log("Server started on port 8000");
});

function handlePing(reply: any[], connection: net.Socket) {
  connection.write("+PONG\r\n");
}
