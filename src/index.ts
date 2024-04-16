import * as net from "node:net";
import Parser from "redis-parser";
import { PubSub } from "./pubSub";
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

import { handleSubscribe, handlePublish, handlePSubscribe, handleUnsubscribe } from "./pubSubFunctions";

import { StreamManager } from "./streams";

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
          psubscribe: handlePSubscribe,
          unsubscribe: handleUnsubscribe,

          //?streams
          xadd: handleXAdd,
          xread: handleXread,

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

const streamManager = new StreamManager();

// handle parsing correctly
function handleXAdd(reply: any, socket: net.Socket, mem: Map<string, any>) {
  const [, streamName, , ...fields] = reply;
  const fieldsObject: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    fieldsObject[fields[i]] = fields[i + 1];
  }
  const id = streamManager.xadd(streamName, fieldsObject);
  socket.write(`+${id}\r\n`);
} 


function handleXread(reply: any, socket: net.Socket) {
  const [, count, , ...streams] = reply;
  const result = streamManager.xread(count, null, streams);
  console.log("result", result);
  socket.write(`*${result.length}\r\n`);
  result.forEach((stream) => {
    socket.write(`*${stream.length}\r\n`);
    stream.forEach((element:any) => {
      if (Array.isArray(element)) {
        socket.write(`*${element.length}\r\n`);
        element.forEach((field) => {
          socket.write(`$${field.length}\r\n${field}\r\n`);
        });
      } else {
        socket.write(`$${element.length}\r\n${element}\r\n`);
      }
    });
  });
}
