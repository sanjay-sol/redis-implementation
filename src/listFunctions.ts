import * as net from "net";

export function handleLPush(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
  const key = reply[1];
  const values = reply.slice(2).reverse();
  if (!mem.has(key)) {
    mem.set(key, []);
  }
  const list = mem.get(key);
  list.unshift(...values);
  connection.write(`:${list.length}\r\n`);
}

export function handleRPush(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
  const key = reply[1];
  const values = reply.slice(2);
  if (!mem.has(key)) {
    mem.set(key, []);
  }
  const list = mem.get(key);
  list.push(...values);
  connection.write(`:${list.length}\r\n`);
}

export function handleLPop(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write("$-1\r\n");
  } else {
    const list = mem.get(key);
    const value = list.shift();
    if (value) {
      connection.write(`$${value.length}\r\n${value}\r\n`);
    } else {
      connection.write("$-1\r\n");
    }
  }
}

export function handleRPop(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write("$-1\r\n");
  } else {
    const list = mem.get(key);
    const value = list.pop();
    if (value) {
      connection.write(`$${value.length}\r\n${value}\r\n`);
    } else {
      connection.write("$-1\r\n");
    }
  }
}

export function handleLRange(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
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

export function handleBRpop(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
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

export function handleBLpop(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
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

export function handleLLen(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, any>
) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write(":0\r\n");
  } else {
    const list = mem.get(key);
    connection.write(`:${list.length}\r\n`);
  }
}
