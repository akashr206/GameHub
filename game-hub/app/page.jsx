import Thumbnail from "@/components/Thumbnail";

const page = () => {
    return (
        <article className="w-screen h-[calc(100vh-64px)] flex gap-4 items-center justify-center">
            <Thumbnail
                image={"/rps.jpeg"}
                name={"Rock Paper Scissors"}
                link={"/rps"}
            ></Thumbnail>
            <Thumbnail
                image={"/xox.png"}
                name={"Tic Tac Toe"}
                link={"/ttt"}
            ></Thumbnail>
        </article>
    );
};

export default page;
