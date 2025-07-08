import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

const Thumbnail = ({ image, name, link }) => {
    return (
        <div className="group p-4 border border-border shadow-xs rounded-xl text-center">
            <Link href={link} className="flex flex-col gap-4">
                <div className="w-44 h-44 overflow-hidden rounded-2xl relative">
                    <span className="opacity-0 group-hover:opacity-100 flex transition-all items-center justify-center bg-black/35 gap-2 backdrop-blur-xs  z-10 absolute inset-0 text-white">
                        Play Game {" "}<SquareArrowOutUpRight className="h-4 w-4" />
                    </span>
                    <img
                        className="group-hover:scale-110 transistion-all duration-300 w-full h-full object-contain "
                        src={image}
                        alt={name}
                    />
                </div>

                <p className="text-lg font-semibold">{name}</p>
            </Link>
        </div>
    );
};

export default Thumbnail;
