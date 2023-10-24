import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./style.css";
import Nav from "@/components/Nav";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Reversi",
    description: "Reversi",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Nav />
                <Toaster
                    containerStyle={{
                        top: 10,
                        left: 10,
                        bottom: 10,
                        right: 10,
                    }}
                />
                {children}
            </body>
        </html>
    );
}
