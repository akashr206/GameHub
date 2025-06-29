import React from "react";

const Navbar = () => {
    return (
        <nav className="fixed w-full flex justify-between items-center px-16 h-16 bg-background/60 backdrop-blur-lg">
            <div>Logo</div>
            <div>navs</div>
            <div>Theme Toggle</div>
        </nav>
    );
};

export default Navbar;
