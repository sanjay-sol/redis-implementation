import * as net from "node:net";
import Parser from "redis-parser";
const mem = new Map<string, string>();
const server: net.Server = net.createServer((connection: net.Socket) => {
    console.log("Client connected...");
    connection.on("data", (data: Buffer) => {
        const parser = new Parser({
            returnReply: (reply : any ) =>  {
                console.log("reply-->", reply);
                const type = reply[0];
                switch (type) {
                    case 'set': {
                        const key = reply[1];
                        const value = reply[2];
                        mem.set(key, value);
                        connection.write('+OK\r\n');
                    }
                    break;
                    case 'get': {
                        const key = reply[1];
                        const value = mem.get(key);
                        console.log("value-->", value);
                        if (!value) {
                            connection.write('$-1\r\n');
                        } else {
                            connection.write(`$${value.length}\r\n${value}\r\n`);
                        }
                    }
                }
                // connection.write(reply);
            },
            returnError: (err: Error) => {
                console.error("error-->",err);
            },
        });
        parser.execute(data);
    });
});

server.listen(8000, () => {
    console.log("Server started on port 8000");
});

// connection.write('-Error any message\r\n);