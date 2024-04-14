import * as net from "node:net";
import Parser from "redis-parser";
import { handleSet, handleGet, handleMGet, handleSetNX } from "./stringFunctions";
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

          //! Strings
          set: handleSet,
          setnx: handleSetNX,
          get: handleGet,
          mget: handleMGet,

          //! Lists
          lpush: handleLPush,
          rpush: handleRPush,
          lpop: handleLPop,
          rpop: handleRPop,
          lrange: handleLRange,
          llen: handleLLen,
          brpop: handleBRpop,
          blpop: handleBLpop,

          //! Sets
          sadd: handleSADD,
          srem: handleSREM,
          sismember: handleSISMEMBER,
          sinter: handleSINTER,
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
