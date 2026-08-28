"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import StatusBar from "@/components/shared/StatusBar";
import BottomDock from "@/components/shared/BottomDock";
import { useAuth } from "@/lib/auth-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Guard: If user is logged in but hasn't completed setup-profil / has no class_name, force setup-profil
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (!user.class_name || !user.student_number) {
        router.replace("/setup-profil");
      }
    }
  }, [user, isLoading, router]);

  // Hide top StatusBar on pages that render their own header, stats, or full-bleed background
  const isDashboard = pathname === "/dashboard";
  const hideStatusBar =
    pathname === "/dashboard" ||
    pathname === "/mission" ||
    pathname === "/leaderboard" ||
    pathname === "/belajar" ||
    pathname === "/profil" ||
    pathname === "/duel" ||
    pathname === "/toko";

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#FFFBEA]">
      {/* Top Status Bar — hidden on Dashboard, Mission, Leaderboard, Belajar, Profil, and Toko */}
      {!hideStatusBar && (
        <StatusBar
          streak={user?.streak ?? 1}
          xp={user?.xp ?? 0}
          coins={user?.coins ?? 0}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`w-full flex flex-col ${
          isDashboard
            ? "h-full flex-1 overflow-hidden"
            : "flex-1 overflow-y-auto overscroll-contain no-scrollbar"
        }`}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation Dock — fixed to viewport via BottomDock's own `fixed` class */}
      <BottomDock />
    </div>
  );
}
