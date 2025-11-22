import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Walrus File Uploader",
  description: "Decentralized file storage on Sui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap app in Providers for Wallet & Sui Access */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}