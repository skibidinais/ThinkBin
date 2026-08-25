import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto bg-gradient-to-b from-[#FFF7ED] to-[#FFEDD5]">
      {/* Onboarding pages are distraction-free without StatusBar & BottomDock */}
      {children}
    </div>
  );
}
