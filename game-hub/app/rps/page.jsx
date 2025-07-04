"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getName, setName } from "@/lib/local";
import { User2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useSearchParams } from "next/navigation";

const page = () => {
    const [userName, setUserName] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const [roomId, setRoomId] = useState("");

    function handleJoin() {
        if (userName.length <= 2) {
            toast.error("Enter a valid name");
            return;
        }
        setName(userName);
        if (roomId.length <= 5) {
            toast.error("Invalid room id");
            return;
        }
        router.push(`rps/${roomId}`);
    }

    function handleCreate() {
        if (userName.length <= 2) {
            toast.error("Enter a valid name");
        }
        setName(userName);
        router.push(`rps/${nanoid(10)}`);
    }

    useEffect(() => {
        setUserName(getName());
        console.log(searchParams.get("id"));
        
        setRoomId(searchParams.get("id") || "");
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] w-screen flex items-center justify-center">
            <Card
                className={
                    "w-full p-8 gap-4 max-w-xs flex flex-col items-center"
                }
            >
                <span className="bg-primary text-primary-foreground p-4 rounded-full">
                    <User2 className="w-10 h-10"></User2>
                </span>
                <div className="w-full text-left">
                    <label htmlFor="name">Enter your name</label>
                    <Input
                        onChange={(e) => setUserName(e.target.value)}
                        value={userName}
                        className="my-1"
                        id="name"
                        placeholder="Name"
                    ></Input>
                    <label htmlFor="room">Room</label>
                    <Input
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        className="mt-1"
                        id="room"
                        placeholder="Room Id"
                    ></Input>
                </div>
                <div className="flex w-full flex-col gap-2">
                    <Button onClick={() => handleJoin()}>Join Room</Button>
                    <Button
                        onClick={() => handleCreate()}
                        variant={"secondary"}
                    >
                        Create Room
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default page;
