"use client";
import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { io } from "socket.io-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

let socket;

const RockPaperScissors = ({ params }) => {
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerChoice, setPlayerChoice] = useState(null);
    const [opponentChoice, setOpponentChoice] = useState(null);
    const [result, setResult] = useState("");
    const [score, setScore] = useState({ player: 0, computer: 0 });
    const [gameHistory, setGameHistory] = useState([]);
    const { id } = use(params);
    const router = useRouter();

    const choicesList = [
        { name: "rock", emoji: "🪨", label: "Rock" },
        { name: "paper", emoji: "📄", label: "Paper" },
        { name: "scissors", emoji: "✂️", label: "Scissors" },
    ];

    const getResultColor = () => {
        if (result.includes("You win!")) return "bg-green-500";
        if (result.includes("You lose")) return "bg-red-500";
        return "bg-yellow-500";
    };

    function joinRoom() {
        if (id.trim()) {
            socket.emit("joinRoom", id, (response) => {
                if (response.success) {
                    setConnected(true);
                } else {
                    toast.error(response.error);
                    router.push("/rps");
                }
            });
        }
    }

    useEffect(() => {
        socket = io("http://localhost:9090/rps", {
            reconnectionAttempts: 2,
            timeout: 8000,
        });

        socket.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
            toast.error("Connection failed. Please try again later.");
            router.push("/rps");
        });

        socket.on("connect", () => {
            joinRoom();
        });

        socket.on("startGame", () => {
            setGameStarted(true);
        });

        socket.on("roundResult", ({ choices, winner }) => {
            try {
                console.log(choices);

                const me = socket.id;
                const opponent = Object.keys(choices).find((id) => id != me);

                setOpponentChoice(choices[opponent]);
                setResult(
                    winner === "draw"
                        ? "Draw"
                        : winner === me
                        ? "You win!"
                        : "You lose"
                );
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("error", (err) => {
            toast.error(err);
        });
    }, []);

    function makeChoice(choice) {
        setPlayerChoice(choice);
        socket.emit("makeChoice", { room: id, choice });
    }

    return (
        <div className="max-w-2xl relative mx-auto p-6 space-y-6">
            {!connected && (
                <div className="absolute inset-0 gap-2 bg-background/65 backdrop-blur-lg z-20 flex flex-col justify-center items-center">
                    <Loader2 className="animate-spin ease-in-out "></Loader2>
                    Connecting to the server
                </div>
            )}
            {connected && !gameStarted && (
                <div className="absolute inset-0 gap-2 bg-background/65 backdrop-blur-lg z-20 flex flex-col justify-center items-center">
                    <Loader2 className="animate-spin ease-in-out "></Loader2>
                    Waiting for the players...
                </div>
            )}

            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">
                        Rock Paper Scissors
                    </CardTitle>
                    <CardDescription>
                        Choose your weapon and battle the computer!
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex justify-center space-x-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {score.player}
                            </div>
                            <div className="text-sm text-muted">You</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl text-gray-400">VS</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {score.computer}
                            </div>
                            <div className="text-sm text-muted">Computer</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {choicesList.map((choice) => (
                            <Button
                                key={choice.name}
                                variant="outline"
                                size="lg"
                                className="h-20 flex flex-col space-y-2 hover:scale-105 transition-transform"
                                onClick={() => makeChoice(choice.name)}
                            >
                                <span className="text-3xl">{choice.emoji}</span>
                                <span className="text-sm">{choice.label}</span>
                            </Button>
                        ))}
                    </div>

                    <Card className="border-2">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center gap-4 items-center">
                                    <div className="text-center flex-1">
                                        <div className="text-4xl mb-2">
                                            {playerChoice}
                                        </div>
                                        <div className="text-sm">You</div>
                                    </div>
                                    <div className="text-2xl text-center font-bold">
                                        VS
                                    </div>
                                    <div className="text-center flex-1">
                                        <div className="text-4xl mb-2">
                                            {opponentChoice}
                                        </div>
                                        <div className="text-sm ">Opponent</div>
                                    </div>
                                </div>

                                <Badge
                                    className={`${getResultColor()} text-white text-lg px-4 py-2`}
                                >
                                    {result}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Game History */}
                    {gameHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Recent Games
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {gameHistory
                                        .slice(-3)
                                        .reverse()
                                        .map((game, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span>
                                                        {game.player.emoji}
                                                    </span>
                                                    <span className="text-sm">
                                                        vs
                                                    </span>
                                                    <span>
                                                        {game.computer.emoji}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant={
                                                        game.winner === "player"
                                                            ? "default"
                                                            : game.winner ===
                                                              "computer"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {game.winner === "tie"
                                                        ? "Tie"
                                                        : game.winner ===
                                                          "player"
                                                        ? "You Won"
                                                        : "Computer Won"}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reset Button */}
                    {(score.player > 0 || score.computer > 0) && (
                        <div className="text-center">
                            <Button variant="outline" onClick={resetGame}>
                                Reset Game
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RockPaperScissors;
