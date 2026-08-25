import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "ThinkBin - My Learning App",
  description: "Eco-adventure gamified learning app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#120b06] antialiased">
        <AuthProvider>
          <main className="tb-mobile-frame relative flex flex-col mx-auto my-auto overflow-hidden">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
