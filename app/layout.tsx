import type { Metadata } from "next";
import "./globals.css";
import "./chat.css";

export const metadata: Metadata = {
  title: {
    default: "AI Starter",
    template: "%s | AI Starter",
  },
  description: "A focused workspace for conversations and ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
