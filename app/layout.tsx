import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIGAP Detection Service",
  description: "Smart Intelligence for Guarding and Analyzing Payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: "'Inter', sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}