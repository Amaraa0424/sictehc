import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RealtimeProvider from "./components/realtime/RealtimeProvider";
import SessionProvider from "./components/providers/SessionProvider";
import NotificationProvider from "./components/providers/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <NotificationProvider>
            <RealtimeProvider>
              {children}
            </RealtimeProvider>
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
