import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Game Hub",
    description: "One - Stop Multiplayer Gaming Platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dar">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <Toaster richColors></Toaster>
                    <Navbar />
                    <main className="pt-16">{children}</main>
                </ThemeProvider>
            </body>
        </html>
    );
}
