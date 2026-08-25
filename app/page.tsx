"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && user.onboarding_completed) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFFBEA] text-[#0F172A] font-fredoka">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <span className="text-4xl animate-bounce">🌿</span>
        <span className="text-sm font-bold text-[#B45309]">Memuat ThinkBin...</span>
      </div>
    </div>
  );
}
