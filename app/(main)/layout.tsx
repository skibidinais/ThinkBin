"use client";

import React from "react";
import StatusBar from "@/components/shared/StatusBar";
import BottomDock from "@/components/shared/BottomDock";
import { useAuth } from "@/lib/auth-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Top Floating Status Bar with reactive user stats starting from pure 0 */}
      <StatusBar
        streak={user?.streak ?? 1}
        xp={user?.xp ?? 0}
        coins={user?.coins ?? 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-y-auto pb-24">
        {children}
      </div>

      {/* Bottom Floating Navigation Dock */}
      <BottomDock />
    </div>
  );
}
