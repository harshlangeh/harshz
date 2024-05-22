import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HarshZ",
  description: "Experience the Z-life editing: fast, easy, efficient",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <div className="container">

        <Navbar/>
        
        {/* {children} */}

        </div>
      
      </body>
    </html>
  );
}
