import type { Metadata, Viewport } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";

// Font serif fantasy untuk tema Mystic
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#1e172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Mystic Booth | Fantasy Photo Strip Creator",
  description: "Abadikan momen magismu dengan Mystic Booth! Buat photo strip bergaya fantasy dengan stiker arcane, warna mistis, dan efek sihir. Gratis & langsung download.",
  keywords: [
    "photobooth",
    "photo strip",
    "mystic booth",
    "fantasy photobooth",
    "online photobooth",
    "photo strip maker",
    "free photobooth",
    "webcam photo",
    "photo editor",
  ],
  authors: [{ name: "Mystic Booth" }],
  creator: "Mystic Booth",
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Mystic Booth | Fantasy Photo Strip Creator",
    description: "Abadikan momen magismu! Buat photo strip bergaya fantasy dengan stiker arcane, warna mistis, dan efek sihir.",
    siteName: "Mystic Booth",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystic Booth | Fantasy Photo Strip Creator",
    description: "Abadikan momen magismu! Buat photo strip bergaya fantasy dengan stiker arcane dan efek sihir.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${cinzel.variable} ${crimsonText.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
