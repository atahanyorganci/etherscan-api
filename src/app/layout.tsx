import { Inter } from "next/font/google";
import { type Layout } from "~/util";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "BetterScan",
    description: "BetterScan is a modern alternative to Etherscan.",
};

const RootLayout: Layout = ({ children }) => {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
};

export default RootLayout;
