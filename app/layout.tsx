import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

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
      <body className="antialiased" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", margin: 0 }}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
