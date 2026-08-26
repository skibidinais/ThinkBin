import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
  preload: true,
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#85dd16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ThinkBin - Eco Learning Game",
  description: "Belajar memilah sampah cerdas dan raih rank tertinggi!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="image"
          href="/screens_assets/mascot_main.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="bg-[#120b06] antialiased">
        <AuthProvider>
          <main className="tb-mobile-frame relative flex flex-col mx-auto my-auto overflow-hidden font-fredoka">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
