import * as net from "node:net";
import Parser from "redis-parser";

const mem = new Map<string, any>();
const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log("Client connected...");

  connection.on("data", (data: Buffer) => {
    const parser = new Parser({
      returnReply: (reply: any) => {
        console.log("reply-->", reply);
        const type = reply[0];
        switch (type) {
          case "set": {
            const key = reply[1];
            const value = reply[2];
            const exist = reply[3];
            if (exist === "nx") {
              if (mem.has(key)) {
                connection.write("-Error key already exist\r\n");
                break;
              }
            }
            mem.set(key, value);
            connection.write("+OK\r\n");
            break;
          }
          case "get": {
            const key = reply[1];
            const value = mem.get(key);
            console.log("value-->", value);
            if (!value) {
              connection.write("$-1\r\n");
            } else {
              connection.write(`$${value.length}\r\n${value}\r\n`);
            }
            break;
          }
          case "mget": {
            const keys = reply.slice(1, reply.length);
            const values: any = [];
            keys.forEach((key: any) => {
              const value = mem.get(key);
              if (value) {
                values.push(value);
              } else {
                values.push(null);
              }
            });
            let response = "";
            values.forEach((value: any) => {
              response += `$${value.length}\r\n${value}\r\n`;
            });
            connection.write(`*${values.length}\r\n${response}`);
            break;
          }
          case "lpush": {
            const key = reply[1];
            const values = reply.slice(2);
            if (!mem.has(key)) {
              mem.set(key, []);
            }
            const list = mem.get(key);
            list.unshift(...values);
            connection.write(`:${list.length}\r\n`);
            break;
          }
          case "rpush": {
            const key = reply[1];
            const values = reply.slice(2);
            if (!mem.has(key)) {
              mem.set(key, []);
            }
            const list = mem.get(key);
            list.push(...values);
            connection.write(`:${list.length}\r\n`);
            break;
          }
          case "lpop": {
            const key = reply[1];
            if (!mem.has(key)) {
              connection.write("$-1\r\n");
            } else {
              const list = mem.get(key);
              const value = list.shift();
              connection.write(`$${value.length}\r\n${value}\r\n`);
            }
            break;
          }
          case "rpop": {
            const key = reply[1];
            if (!mem.has(key)) {
              connection.write("$-1\r\n");
            } else {
              const list = mem.get(key);
              const value = list.pop();
              connection.write(`$${value.length}\r\n${value}\r\n`);
            }
            break;
          }
         
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
