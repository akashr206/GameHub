import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
export default function Home() {
    return (
        <div className="w-screen h-[calc(100vh-64px)] flex flex-col gap-2 items-center justify-center">
            <h2 className="font-bold text-3xl">Select Game</h2>
            <div>
                <Link href={"/rps"}>
                    <Button>
                        Rock Paper Scissors <ArrowUpRight></ArrowUpRight>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
