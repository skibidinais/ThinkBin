"use client";

import React from "react";
import { usePathname } from "next/navigation";
import StatusBar from "@/components/shared/StatusBar";
import BottomDock from "@/components/shared/BottomDock";
import { useAuth } from "@/lib/auth-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Hide top StatusBar on pages that render their own floating overlay header or full-bleed background
  const isDashboard = pathname === "/dashboard";
  const hideStatusBar =
    pathname === "/dashboard" ||
    pathname === "/mission" ||
    pathname === "/leaderboard" ||
    pathname === "/belajar";

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#FFFBEA]">
      {/* Top Status Bar — hidden on Dashboard, Mission, Leaderboard, and Belajar */}
      {!hideStatusBar && (
        <StatusBar
          streak={user?.streak ?? 1}
          xp={user?.xp ?? 0}
          coins={user?.coins ?? 0}
        />
      )}

      {/* Main Scrollable Content Area with smooth touch scrolling */}
      <main
        className={`flex-1 w-full flex flex-col ${
          isDashboard
            ? "overflow-hidden"
            : "overflow-y-auto overscroll-contain no-scrollbar"
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
