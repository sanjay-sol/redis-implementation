import * as net from "node:net";

export function handleSADD(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, Set<any>>
) {
  const key = reply[1];
  const value = reply[2];
  if (!mem.has(key)) {
    mem.set(key, new Set());
  }
  const setObj = mem.get(key); 
  if (setObj?.has(value)) {
    connection.write(":0\r\n");
  } else {
    setObj?.add(value);
    connection.write(`:${setObj?.size}\r\n`);
  }
}


export function handleSREM(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, Set<any>>
) {
  const key = reply[1];
  const value = reply[2];
  if (!mem.has(key)) {
    connection.write(":0\r\n");
    return;
  }
  const set = mem.get(key);
  if (set?.delete(value)) {
    connection.write(":1\r\n");
  } else {
    connection.write(":0\r\n");
  }
}

export function handleSISMEMBER(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, Set<any>>
) {
  const key = reply[1];
  const value = reply[2];
  if (!mem.has(key)) {
    connection.write(":0\r\n");
    return;
  }
  const set = mem.get(key);
  if (set?.has(value)) {
    connection.write(":1\r\n");
  } else {
    connection.write(":0\r\n");
  }
}

export function handleSINTER(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, Set<any>>
) {
  const keys = reply.slice(1);
  const sets = keys.map((key: string) => mem.get(key) || new Set());
  const intersection = sets.reduce((acc, set) => {
    return new Set([...acc].filter((value) => set.has(value)));
  });
  connection.write(`*${intersection.size}\r\n`);
  intersection.forEach((value) => {
    connection.write(`$${value.length}\r\n${value}\r\n`);
  });
}

export function handleSCARD(
  reply: any[],
  connection: net.Socket,
  mem: Map<string, Set<any>>
) {
  const key = reply[1];
  if (!mem.has(key)) {
    connection.write(":0\r\n");
    return;
  }
  const set = mem.get(key);
  connection.write(`:${set?.size}\r\n`);
}
