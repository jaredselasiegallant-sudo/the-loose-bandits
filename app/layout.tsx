import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettingsServer } from "@/lib/site-server";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Loose Bandits — family blog (placeholder)",
    template: "%s · The Loose Bandits",
  },
  description:
    "Placeholder site shell for The Loose Bandits, a four-voice personal family blog. Real names, bios, and essays to be supplied by the founder.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettingsServer();
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div id="main" className="flex-1">
          {children}
        </div>
        <footer className="border-t-2 border-[var(--foreground)] mt-16">
          <div className="mx-auto max-w-6xl px-5 py-8 flex flex-wrap gap-4 items-center justify-between">
            <p className="font-display font-bold">{settings.wordmark_text}</p>
            <p className="meta">{settings.footer_text} · © TODO year</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
