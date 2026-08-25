import React from "react";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto bg-[#FDE8A5]">
      {/* Focus Mode: Clean distraction-free view without BottomDock */}
      {children}
    </div>
  );
}
