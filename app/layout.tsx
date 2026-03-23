import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, Syne } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif"
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans"
});

const display = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "RoastMyResume — FAANG Recruiter Simulator",
  description: "AI-powered resume roaster and recruiter simulator"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} ${display.variable} font-sans`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
