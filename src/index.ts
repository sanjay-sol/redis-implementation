import * as net from "node:net";

const server: net.Server = net.createServer((connection: net.Socket) => {
    console.log("Client connected...");
    connection.on("data", (data: Buffer) => {
        console.log(data.toString());
        connection.write('+OK\r\n');
    });
});

server.listen(8000, () => {
    console.log("Server started on port 8000");
});
