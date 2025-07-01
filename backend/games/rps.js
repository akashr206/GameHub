module.exports = function (io) {
    const rooms = {};
    const choices = {};
    const names = {};
    const scores = {};
    io.on("connection", (socket) => {
        socket.on("joinRoom", ({ id, name }, callback) => {
            const room = id;
            if (!room) {
                return callback({
                    success: false,
                    error: "Room ID is missing",
                });
            }
            if (rooms[room] && rooms[room].size >= 2) {
                return callback({ success: false, error: "Room is full" });
            }

            socket.join(room);
            if (!rooms[room]) rooms[room] = new Set();
            rooms[room].add(socket.id);
            if (!name) name = "Player" + rooms[room].size;
            if (!names[room]) names[room] = {};
            names[room][socket.id] = name;
            if (rooms[room].size === 2) {
                io.to(room).emit("startGame", {
                    names: names[room],
                });
            }
            console.log(" [RPS] Connected : ", socket.id);
            callback({ success: true });
        });

        socket.on("makeChoice", ({ room, choice }) => {
            if (!choices[room]) choices[room] = {};

            choices[room][socket.id] = choice;
            if (!scores[room]) scores[room] = {};

            if (!scores[room][socket.id]) scores[room][socket.id] = 0;
            if (Object.keys(choices[room]).length === 2) {
                const [p1, p2] = Object.keys(choices[room]);
                const c1 = choices[room][p1];
                const c2 = choices[room][p2];

                const result = decideWinner(c1, c2);
                const winner =
                    result === "draw" ? "draw" : result === c1 ? p1 : p2;
                if (winner !== "draw") {
                    scores[room][winner] += 1;
                }
                scores[room][socket.id];
                io.to(room).emit("roundResult", {
                    choices: { [p1]: c1, [p2]: c2 },
                    score : scores[room],
                    winner,
                });
                delete choices[room];
            }
        });

        socket.on("disconnect", () => {
            for (const room in rooms) {
                if (rooms[room].has(socket.id)) {
                    rooms[room].delete(socket.id);
                    delete choices?.[room]?.[socket.id];
                    delete names?.[room]?.[socket.id];
                    io.to(room).emit("playerLeft", {
                        remainingPlayer: rooms[room],
                    });

                    if (rooms[room].size <= 0) {
                        delete rooms[room];
                        delete choices[room];
                    }
                    break;
                }
            }
            console.log("[RPS] Disconnected : ", socket.id);
        });
    });
    function decideWinner(a, b) {
        if (a === b) return "draw";
        const winMap = { rock: "scissors", paper: "rock", scissors: "paper" };
        return winMap[a] === b ? a : b;
    }
};
