import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Display face — the wordmark and section headlines only. Clash Display's
// axis stops at 700, so nothing may ask it for 800/900 (see globals.css).
const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
});

// Text face — everything else. Neutral by design; it should disappear.
const switzer = localFont({
  src: "./fonts/Switzer-Variable.woff2",
  variable: "--font-switzer",
  weight: "100 900",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sachit Ghimire — Full Stack Developer",
  description:
    "Kathmandu-based developer with a design background. Selected websites and internal tools built with Next.js, Node.js and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${switzer.variable} ${geistMono.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-text-paper">
        {children}
      </body>
    </html>
  );
}
