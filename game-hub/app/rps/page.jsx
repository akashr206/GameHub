"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getName } from "@/lib/local";
import { User2 } from "lucide-react";
import { useState, useEffect } from "react";
const page = () => {
    const [userName, setUserName] = useState("");
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        setUserName(getName());
    }, []);

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <Card className={"w-full p-8 gap-4 max-w-xs flex flex-col items-center"}>
                <span className="bg-secondary text-primary-foreground p-4 rounded-full">
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
                        className="mt-1"
                        id="room"
                        placeholder="Room Id"
                    ></Input>
                </div>
                <div className="flex w-full flex-col gap-2">
                    <Button>Join Room</Button>
                    <Button variant={"secondary"}>Create Room</Button>
                </div>
            </Card>
        </div>
    );
};

export default page;
