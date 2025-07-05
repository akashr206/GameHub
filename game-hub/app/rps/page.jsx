"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getName, setName } from "@/lib/local";
import { User2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";

const RoomForm = () => {
    const [userName, setUserName] = useState("");
    const [roomId, setRoomId] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        setUserName(getName() || "");

        const idFromParams = searchParams.get("id");
        if (idFromParams) {
            setRoomId(idFromParams);
        }
    }, [searchParams]);

    function handleJoin() {
        if (userName.length <= 2) {
            toast.error("Enter a valid name");
            return;
        }
        if (roomId.length <= 5) {
            toast.error("Invalid room id");
            return;
        }
        setName(userName);
        router.push(`rps/${roomId}`);
    }

    function handleCreate() {
        if (userName.length <= 2) {
            toast.error("Enter a valid name");
            return;
        }
        setName(userName);
        router.push(`rps/${nanoid(10)}`);
    }

    return (
        <div className="h-[calc(100vh-64px)] w-screen flex items-center justify-center">
            <Card className="w-full p-8 gap-4 max-w-xs flex flex-col items-center">
                <span className="bg-primary text-primary-foreground p-4 rounded-full">
                    <User2 className="w-10 h-10" />
                </span>
                <div className="w-full text-left">
                    <label htmlFor="name">Enter your name</label>
                    <Input
                        onChange={(e) => setUserName(e.target.value)}
                        value={userName}
                        className="my-1"
                        id="name"
                        placeholder="Name"
                    />
                    <label htmlFor="room">Room</label>
                    <Input
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        className="mt-1"
                        id="room"
                        placeholder="Room Id"
                    />
                </div>
                <div className="flex w-full flex-col gap-2">
                    <Button onClick={handleJoin}>Join Room</Button>
                    <Button onClick={handleCreate} variant={"secondary"}>
                        Create Room
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RoomForm />
        </Suspense>
    );
};

export default Page;
