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

  // Hide top StatusBar on Beranda and Mission page since they have their own custom header
  const isDashboard = pathname === "/dashboard";
  const hideStatusBar = pathname === "/dashboard" || pathname === "/mission";

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#FFFBEA]">
      {/* Top Status Bar — hidden on Beranda and Mission page */}
      {!hideStatusBar && (
        <StatusBar
          streak={user?.streak ?? 1}
          xp={user?.xp ?? 0}
          coins={user?.coins ?? 0}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 w-full flex flex-col ${isDashboard ? "overflow-hidden" : "overflow-y-auto no-scrollbar"}`}>
        {children}
      </div>

      {/* Bottom Navigation Dock — fixed to viewport via BottomDock's own `fixed` class */}
      <BottomDock />
    </div>
  );
}
