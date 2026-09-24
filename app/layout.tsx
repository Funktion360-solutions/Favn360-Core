import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favn360",
  description: "Digital dagbog og funktionsdokumentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
