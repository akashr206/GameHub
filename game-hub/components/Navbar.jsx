import ThemeToggle from "./ThemeToggle";
const Navbar = () => {
    return (
        <nav className="fixed w-full flex justify-between items-center px-16 h-16 bg-background/60 backdrop-blur-lg">
            <div>Game Hub</div>
            <nav className="flex gap-2 items-center justify-center">
                {" "}
                <ul>
                    <li>Single Payer Games</li>
                    <li>Multiplayer Games</li>
                    <li>About</li>
                </ul>{" "}
            </nav>
            <div>
                <ThemeToggle />
            </div>
        </nav>
    );
};

export default Navbar;
