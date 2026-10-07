import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { meta } from "@/constants/id";
import "./globals.css";

// DESIGN.md: Space Grotesk headings, Inter body, JetBrains Mono numbers — self-hosted by next/font
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7fafc",
};

// Runs before paint so motion-only initial states never flash for reduced-motion users.
const motionFlag =
  "if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js')";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
