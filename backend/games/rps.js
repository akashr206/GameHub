module.exports = function (io) {
    const rooms = {};
    const choices = {};
    const scores = {};
    io.on("connection", (socket) => {
        console.log("[RPS] Player connected:", socket.id);

        socket.on("joinRoom", (room, callback) => {
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

            if (rooms[room].size === 2) {
                io.to(room).emit("startGame");
            }
            callback({ success: true });
        });

        socket.on("makeChoice", ({ room, choice }) => {
            console.log();
            
            if (!choices[room]) choices[room] = {};
            choices[room][socket.id] = choice;
            if (Object.keys(choices[room]).length === 2) {
                const [p1, p2] = Object.keys(choices[room]);
                const c1 = choices[room][p1];
                const c2 = choices[room][p2];

                const result = decideWinner(c1, c2);
                const winner =
                    result === "draw" ? "draw" : result === c1 ? p1 : p2;

                io.to(room).emit("roundResult", {
                    choices: { [p1]: c1, [p2]: c2 },
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

                    io.to(room).emit("playerLeft");

                    if (rooms[room].size === 0) {
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
