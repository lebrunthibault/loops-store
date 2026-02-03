import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { AudioPlayer } from "@/components/audio-player";
import { AudioPlayerProvider } from "@/hooks/use-audio-player";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loops - Piano Audio Marketplace",
  description: "Discover and purchase high-quality piano loops for your music production",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AudioPlayerProvider>
            <Header />
            <main className="min-h-screen pb-24">
              {children}
            </main>
            <AudioPlayer />
            <Toaster />
          </AudioPlayerProvider>
        </Providers>
      </body>
    </html>
  );
}
