const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const rps = require("./games/rps");

const app = express();
app.use(
    cors({
        origin: "*",
    })
);
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const rpsNamespaces = io.of("/rps");
rps(rpsNamespaces);

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
});

server.listen(9090, () => {
    console.log("Listening to the port", 9090);
});
