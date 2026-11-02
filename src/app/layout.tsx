import type { Metadata } from "next";
import "./globals.css";
import "./cinematic.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://br-burger.example"),
  title: "BR-Burger — Every layer tells a story.",
  description:
    "A little obsession. A lot of flavor. Discover the BR-Burger signature collection in seven delicious chapters.",
  openGraph: {
    title: "BR-Burger — Crafted to perfection",
    description: "Every layer tells a story.",
    images: ["/assets/images/burger.webp"],
  },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
