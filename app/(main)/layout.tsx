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

  // Hide StatusBar on Beranda (/dashboard) so background scenery touches the top edge-to-edge
  const hideStatusBar = pathname === "/dashboard";

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col overflow-hidden bg-[#FFFBEA]">
      {/* Top Floating Status Bar only on pages other than Beranda */}
      {!hideStatusBar && (
        <StatusBar
          streak={user?.streak ?? 1}
          xp={user?.xp ?? 0}
          coins={user?.coins ?? 0}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">
        {children}
      </div>

      {/* Bottom Floating Navigation Dock */}
      <BottomDock />
    </div>
  );
}
