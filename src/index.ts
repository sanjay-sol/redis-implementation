import * as net from "node:net";
import Parser from "redis-parser";

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
        };

        const handler = commandHandlers[type];
        if (handler) {
          handler(reply, connection);
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

function handleSet(reply: any[], connection: net.Socket) {
  const key = reply[1];
  const value = reply[2];
  const exist = reply[3];
  if (exist === "nx") {
    if (mem.has(key)) {
      connection.write("-Error key already exist\r\n");
      return;
    }
  }
  mem.set(key, value);
  connection.write("+OK\r\n");
}

function handleGet(reply: any[], connection: net.Socket) {
  const key = reply[1];
  const value = mem.get(key);
  console.log("value-->", value);
  if (!value) {
    connection.write("$-1\r\n");
  } else {
    connection.write(`$${value.length}\r\n${value}\r\n`);
  }
}

function handleMGet(reply: any[], connection: net.Socket) {
  const keys = reply.slice(1);
  const values: any[] = [];
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
    if (value) {
      response += `$${value.length}\r\n${value}\r\n`;
    } else {
      response += "$-1\r\n";
    }
  });
  connection.write(`*${values.length}\r\n${response}`);
}

function handleLPush(reply: any[], connection: net.Socket) {
  const key = reply[1];
  const values = reply.slice(2);
  if (!mem.has(key)) {
    mem.set(key, []);
  }
  const list = mem.get(key);
  list.unshift(...values);
  connection.write(`:${list.length}\r\n`);
}

function handleRPush(reply: any[], connection: net.Socket) {
  const key = reply[1];
  const values = reply.slice(2);
  if (!mem.has(key)) {
    mem.set(key, []);
  }
  const list = mem.get(key);
  list.push(...values);
  connection.write(`:${list.length}\r\n`);
}

function handleLPop(reply: any[], connection: net.Socket) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write("$-1\r\n");
  } else {
    const list = mem.get(key);
    const value = list.shift();
    connection.write(`$${value.length}\r\n${value}\r\n`);
  }
}

function handleRPop(reply: any[], connection: net.Socket) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write("$-1\r\n");
  } else {
    const list = mem.get(key);
    const value = list.pop();
    connection.write(`$${value.length}\r\n${value}\r\n`);
  }
}

function handleLRange(reply: any[], connection: net.Socket) {
  const key = reply[1];
  const start = reply[2];
  const end = reply[3];
  if (!mem.has(key)) {
    connection.write("*0\r\n");
  } else {
    const list = mem.get(key);
    const values = list.slice(start, end);
    let response = "";
    values.forEach((value: any) => {
      response += `$${value.length}\r\n${value}\r\n`;
    });
    connection.write(`*${values.length}\r\n${response}`);
  }
}

function handleBRpop(reply: any[], connection: net.Socket) {
  const keys = reply.slice(1, -1);
  const timeout = reply[reply.length - 1];
  let value: any;
  let key: any;
  let list: any;
  let index: number;
  const check = () => {
    for (let i = 0; i < keys.length; i++) {
      key = keys[i];
      list = mem.get(key);
      if (list.length > 0) {
        index = list.length - 1;
        value = list[index];
        list.splice(index, 1);
        connection.write(
          `*2\r\n$${key.length}\r\n${key}\r\n$${value.length}\r\n${value}\r\n`
        );
        return;
      }
    }
    setTimeout(check, timeout * 1000);
  };
  check();
}

function handleBLpop(reply: any[], connection: net.Socket) {
  const keys = reply.slice(1, -1);
  const timeout = reply[reply.length - 1];
  let value: any;
  let key: any;
  let list: any;
  let index: number;
  const check = () => {
    for (let i = 0; i < keys.length; i++) {
      key = keys[i];
      list = mem.get(key);
      if (list.length > 0) {
        index = 0;
        value = list[index];
        list.splice(index, 1);
        connection.write(
          `*2\r\n$${key.length}\r\n${key}\r\n$${value.length}\r\n${value}\r\n`
        );
        return;
      }
    }
    setTimeout(check, timeout * 1000);
  };
  check();
}

function handleLLen(reply: any[], connection: net.Socket) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write(":0\r\n");
  } else {
    const list = mem.get(key);
    connection.write(`:${list.length}\r\n`);
  }
}
