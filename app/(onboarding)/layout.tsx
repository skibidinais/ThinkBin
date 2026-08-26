import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
