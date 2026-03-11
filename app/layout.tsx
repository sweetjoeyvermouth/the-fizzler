import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Fizzler",
  description: "Let them down easy.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
