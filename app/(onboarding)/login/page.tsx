"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, loginWithGoogle } = useAuth();

  // Auto-bypass for existing onboarded users
  useEffect(() => {
    if (!isLoading && user && user.onboarding_completed) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    router.push("/setup-profil");
  };

  return (
    <div
      className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between items-center px-6 py-6 select-none overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #85dd16 0%, #68c309 100%)",
      }}
    >
      {/* ── CSS FOR MASCOT FLOATING ANIMATION ── */}
      <style jsx>{`
        @keyframes mascotFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .mascot-hero {
          animation: mascotFloat 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── CENTERED SINGLE-VIEWPORT CONTENT GROUP ── */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-auto max-w-[360px]">
        
        {/* 1. MASCOT HERO ILLUSTRATION */}
        <div className="relative w-full flex items-center justify-center mb-4">
          {/* Subtle waving motion arcs on top-right */}
          <div className="absolute top-2 right-4 text-[#4a8500] font-black text-2xl opacity-60 pointer-events-none select-none">
            ))
          </div>

          <div className="mascot-hero relative w-60 h-60 sm:w-64 sm:h-64 max-h-[38vh] aspect-square flex items-center justify-center">
            <Image
              src="/screens_assets/mascot_main.png"
              alt="ThinkBin Mascot Hero"
              width={260}
              height={260}
              className="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.22)] pointer-events-none"
              priority
            />
          </div>
        </div>

        {/* 2. WELCOME TEXT (Heading & Subtext) */}
        <div className="text-center px-1 mb-6">
          <h1 className="font-fredoka font-black text-[27px] sm:text-[30px] text-[#0b1a2d] leading-tight mb-2 tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
            Selamat Datang di ThinkBin!
          </h1>
          <p className="font-nunito font-extrabold text-[14px] sm:text-[14.5px] text-[#1e3a1e] leading-relaxed max-w-[310px] mx-auto">
            Belajar memilah sampah cerdas, kumpulkan poin, dan raih rank tertinggi bersama teman sekelasmu!
          </p>
        </div>

        {/* 3. PROMINENT BOLD GOOGLE SIGN-IN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full max-w-[290px] h-[54px] sm:h-[58px] bg-white border-[3px] border-[#1e293b] rounded-[24px] shadow-[0_5px_0_#1e293b] active:translate-y-[3px] active:shadow-[0_2px_0_#1e293b] flex items-center justify-center gap-3 cursor-pointer transition-all hover:bg-[#f8fafc]"
        >
          {/* Google Official SVG Icon */}
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-fredoka font-black text-[18px] text-[#0f172a] tracking-wide">
            Google
          </span>
        </button>
      </div>

    </div>
  );
}
