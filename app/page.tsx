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
    <div className="flex items-center justify-center min-h-screen bg-[#120b06] text-white font-fredoka">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <span className="text-3xl">🌿</span>
        <span className="text-sm">Memuat ThinkBin...</span>
      </div>
    </div>
  );
}
