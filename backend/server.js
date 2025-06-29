const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const rpsNamespaces = io.of("/rps");
require("./games/rps")(rpsNamespaces);

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
});

server.listen(9090, () => {
    console.log("Listening to the port", 9090);
});
