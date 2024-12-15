import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meta AI (but much better) 🚀",
  description:
    "Advanced Meta AI with faster responses, realtime weather updates, AI image generation and internet image serach!🔥🦙",
  authors: [
    {
      name: "Anish",
      url: "https://dub.sh/anish7",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.className} antialiased`}>{children}</body>
    </html>
  );
}
