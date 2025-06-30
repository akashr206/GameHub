"use client";
import { useState, use, useEffect, useRef } from "react";
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
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getName } from "@/lib/local";

const RockPaperScissors = ({ params }) => {
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [opponentName, setOpponentName] = useState(null);
    const [playerChoice, setPlayerChoice] = useState(null);
    const [opponentChoice, setOpponentChoice] = useState(null);
    const [result, setResult] = useState("");
    const [score, setScore] = useState({ player: 0, opponent: 0 });
    const [roundTimer, setRoundTimer] = useState(0);
    const [choiceTimer, setChoiceTimer] = useState(30);
    const [showResult, setShowResult] = useState(false);
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);
    const [gameWinner, setGameWinner] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [gamePhase, setGamePhase] = useState("waiting");
    const { id } = use(params);
    const router = useRouter();
    const roundTimerRef = useRef(null);
    const choiceTimerRef = useRef(null);
    const socketRef = useRef(null);
    const hasAutoSelectedRef = useRef(false);

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

    const clearAllTimers = () => {
        if (roundTimerRef.current) {
            clearInterval(roundTimerRef.current);
            roundTimerRef.current = null;
        }
        if (choiceTimerRef.current) {
            clearInterval(choiceTimerRef.current);
            choiceTimerRef.current = null;
        }
    };

    const startRoundTimer = () => {
        clearAllTimers();
        setRoundTimer(5);
        setGamePhase("showing");
        
        roundTimerRef.current = setInterval(() => {
            setRoundTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(roundTimerRef.current);
                    roundTimerRef.current = null;
                    resetRound();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startChoiceTimer = () => {
        clearAllTimers();
        setChoiceTimer(30);
        setGamePhase("choosing");
        hasAutoSelectedRef.current = false;
        
        choiceTimerRef.current = setInterval(() => {
            setChoiceTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(choiceTimerRef.current);
                    choiceTimerRef.current = null;
                    
                    if (!hasAutoSelectedRef.current) {
                        hasAutoSelectedRef.current = true;
                        setPlayerChoice("🪨");
                        setWaitingForOpponent(true);
                        toast.warning("Time's up! Rock was automatically selected.");
                        
                        if (socketRef.current) {
                            socketRef.current.emit("makeChoice", { room: id, choice: "rock" });
                        }
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resetRound = () => {
        clearAllTimers();
        setPlayerChoice(null);
        setOpponentChoice(null);
        setResult("");
        setShowResult(false);
        setWaitingForOpponent(false);
        hasAutoSelectedRef.current = false;
        
        if (score.player >= 10 || score.opponent >= 10) {
            setGameEnded(true);
            setGameWinner(score.player >= 10 ? "You" : opponentName || "Opponent");
            setGamePhase("ended");
            return;
        }
        
        setTimeout(() => {
            setGamePhase("choosing");
            startChoiceTimer();
        }, 100);
    };

    const initializeSocket = () => {
        if (socketRef.current) {
            return;
        }

        try {
            socketRef.current = io("http://localhost:9090/rps", {
                reconnectionAttempts: 3,
                timeout: 10000,
                forceNew: true,
            });

            socketRef.current.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
                toast.error("Connection failed. Please try again later.");
                router.push("/rps");
            });

            socketRef.current.on("connect", () => {
                joinRoom();
            });

            socketRef.current.on("startGame", ({ names }) => {
                try {
                    const me = socketRef.current.id;
                    const opponent = Object.keys(names).find((id) => id !== me);
                    
                    if (!opponent || !names[opponent]) {
                        toast.error("Invalid game setup. Missing opponent information.");
                        return;
                    }
                    
                    setOpponentName(names[opponent]);
                    setGameStarted(true);
                    setGamePhase("choosing");
                    startChoiceTimer();
                } catch (error) {
                    console.error("Error starting game:", error);
                    toast.error("Failed to start game. Please try again.");
                }
            });

            socketRef.current.on("roundResult", ({ choices, winner, score: gameScore }) => {
                try {
                    const me = socketRef.current.id;
                    const opponent = Object.keys(choices).find((id) => id !== me);

                    if (!opponent || !choices[opponent]) {
                        toast.error("Invalid round result. Missing opponent choice.");
                        return;
                    }

                    clearAllTimers();

                    const opponentChoiceName = choices[opponent];
                    const opponentChoiceObj = choicesList.find(c => c.name === opponentChoiceName);
                    const opponentChoiceEmoji = opponentChoiceObj ? opponentChoiceObj.emoji : "❓";

                    setOpponentChoice(opponentChoiceEmoji);
                    
                    const resultText = winner === "draw" 
                        ? "Draw" 
                        : winner === me 
                        ? "You win!" 
                        : "You lose";
                    
                    setResult(resultText);
                    setShowResult(true);
                    setWaitingForOpponent(false);

                    if (gameScore) {
                        const playerScore = gameScore[me] || 0;
                        const opponentScore = gameScore[opponent] || 0;
                        setScore({ player: playerScore, opponent: opponentScore });
                    }

                    startRoundTimer();
                    
                } catch (error) {
                    console.error("Error processing round result:", error);
                    toast.error("Error processing round result.");
                }
            });

            socketRef.current.on("error", (err) => {
                toast.error(err || "An unknown error occurred");
            });

            socketRef.current.on("disconnect", () => {
                toast.warning("Disconnected from server");
                clearAllTimers();
                setConnected(false);
            });

            socketRef.current.on("playerLeft", ({ leftPlayerName, remainingPlayer }) => {
                clearAllTimers();
                console.log(remainingPlayer);
                
                if (remainingPlayer === socketRef.current.id) {
                    toast.info(`${leftPlayerName || "Opponent"} left the game`);
                    setGameStarted(false);
                    setGamePhase("waiting");
                    setOpponentName(null);
                    setPlayerChoice(null);
                    setOpponentChoice(null);
                    setResult("");
                    setShowResult(false);
                    setWaitingForOpponent(false);
                    setGameEnded(false);
                    setGameWinner(null);
                    setScore({ player: 0, opponent: 0 });
                } else {
                    toast.info("You left the game");
                    router.push("/rps");
                }
            });

        } catch (error) {
            console.error("Socket initialization error:", error);
            toast.error("Failed to initialize connection");
        }
    };

    const joinRoom = () => {
        const playerName = getName();
        
        if (!playerName || playerName.trim() === "") {
            toast.error("Player name is required. Please set your name first.");
            router.push("/rps");
            return;
        }

        if (!id || id.trim() === "") {
            toast.error("Invalid room ID.");
            router.push("/rps");
            return;
        }

        if (socketRef.current) {
            socketRef.current.emit("joinRoom", { id: id.trim(), name: playerName.trim() }, (response) => {
                if (response && response.success) {
                    setConnected(true);
                } else {
                    toast.error(response?.error || "Failed to join room");
                    router.push("/rps");
                }
            });
        }
    };

    const makeChoice = (choice) => {
        if (!choicesList.find(c => c.name === choice)) {
            toast.error("Invalid choice selected");
            return;
        }

        if (gamePhase !== "choosing") {
            return;
        }

        if (playerChoice || hasAutoSelectedRef.current) {
            return;
        }

        const selectedChoice = choicesList.find(c => c.name === choice);
        setPlayerChoice(selectedChoice.emoji);
        setWaitingForOpponent(true);
        hasAutoSelectedRef.current = true;
        
        clearAllTimers();
        setChoiceTimer(0);

        if (socketRef.current) {
            socketRef.current.emit("makeChoice", { room: id, choice });
        }
    };

    const resetGame = () => {
        clearAllTimers();
        setScore({ player: 0, opponent: 0 });
        setGameWinner(null);
        setGameEnded(false);
        setGamePhase("choosing");
        hasAutoSelectedRef.current = false;
        resetRound();
    };

    const getTimerColor = (timer, maxTime) => {
        const percentage = timer / maxTime;
        if (percentage > 0.5) return "text-green-600";
        if (percentage > 0.2) return "text-yellow-600";
        return "text-red-600";
    };

    useEffect(() => {
        initializeSocket();

        return () => {
            clearAllTimers();
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (
        <div className="max-w-2xl relative mx-auto p-6 space-y-6">
            {!connected && (
                <div className="absolute inset-0 gap-2 bg-background/65 backdrop-blur-lg z-20 flex flex-col justify-center items-center">
                    <Loader2 className="animate-spin ease-in-out" />
                    <p className="text-sm text-muted-foreground">Connecting to the server...</p>
                </div>
            )}
            
            {connected && !gameStarted && (
                <div className="absolute inset-0 gap-2 bg-background/65 backdrop-blur-lg z-20 flex flex-col justify-center items-center">
                    <Loader2 className="animate-spin ease-in-out" />
                    <p className="text-sm text-muted-foreground">Waiting for the players...</p>
                </div>
            )}

            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">
                        Rock Paper Scissors
                    </CardTitle>
                    <CardDescription>
                        Choose your weapon and battle the opponent!
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {gameStarted && gamePhase !== "ended" && (
                        <div className="text-center">
                            {gamePhase === "choosing" && choiceTimer > 0 && !playerChoice && (
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className={`font-bold ${getTimerColor(choiceTimer, 30)}`}>
                                        Choose in: {choiceTimer}s
                                    </span>
                                </div>
                            )}
                            {gamePhase === "showing" && roundTimer > 0 && (
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className={`font-bold ${getTimerColor(roundTimer, 5)}`}>
                                        Next round in: {roundTimer}s
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center space-x-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {score.player}
                            </div>
                            <div className="text-sm text-muted-foreground">You</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl text-gray-400">VS</div>
                            <div className="text-xs text-gray-400 mt-1">First to 10</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {score.opponent}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {opponentName || "Opponent"}
                            </div>
                        </div>
                    </div>

                    {gameEnded && (
                        <Card className="border-4 border-gold">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <div className="text-6xl mb-4">
                                        {gameWinner === "You" ? "🏆" : "💔"}
                                    </div>
                                    <h2 className="text-3xl font-bold">
                                        {gameWinner === "You" ? "Congratulations!" : "Game Over"}
                                    </h2>
                                    <p className="text-xl">
                                        {gameWinner === "You" 
                                            ? "You won the match!" 
                                            : `${gameWinner} won the match!`
                                        }
                                    </p>
                                    <p className="text-lg text-muted-foreground">
                                        Final Score: {score.player} - {score.opponent}
                                    </p>
                                    <Button 
                                        onClick={resetGame}
                                        size="lg"
                                        className="mt-4"
                                    >
                                        Play Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {gamePhase === "choosing" && !playerChoice && !gameEnded && (
                        <div className="grid grid-cols-3 gap-4">
                            {choicesList.map((choice) => (
                                <Button
                                    key={choice.name}
                                    variant="outline"
                                    size="lg"
                                    className="h-20 flex flex-col space-y-2 hover:scale-105 transition-transform"
                                    onClick={() => makeChoice(choice.name)}
                                    disabled={choiceTimer === 0 || hasAutoSelectedRef.current}
                                >
                                    <span className="text-3xl">{choice.emoji}</span>
                                    <span className="text-sm">{choice.label}</span>
                                </Button>
                            ))}
                        </div>
                    )}

                    {waitingForOpponent && !showResult && !gameEnded && (
                        <div className="text-center py-8">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin w-8 h-8" />
                                <p className="text-lg font-medium">You chose {playerChoice}</p>
                                <p className="text-sm text-muted-foreground">
                                    Waiting for {opponentName || "opponent"} to choose...
                                </p>
                            </div>
                        </div>
                    )}

                    {showResult && !gameEnded && (
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
                                            <div className="text-sm">
                                                {opponentName || "Opponent"}
                                            </div>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RockPaperScissors;