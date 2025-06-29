"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Button
            variant={"ghost"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            {" "}
            {theme === "light" ? <Moon /> : <Sun />}
        </Button>
    );
};

export default ThemeToggle;
