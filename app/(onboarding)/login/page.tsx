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
    <div className="flex flex-col min-h-screen bg-[#FFFBEA] p-6 pb-9 justify-between select-none">
      <div className="flex flex-col flex-1 items-center justify-center">
        {/* Mascot Hero Illustration with floating animation */}
        <div className="w-full flex justify-center items-center py-6">
          <div className="relative w-44 h-44 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
            <Image
              src="/assets/mascot_leonardo.png"
              alt="ThinkBin Mascot"
              width={175}
              height={175}
              className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.15)]"
              priority
            />
          </div>
        </div>

        {/* Welcome Text Box */}
        <div className="text-center mb-7 px-2">
          <span className="inline-block bg-[#FEF3C7] text-[#B45309] border-[2px] border-[#F59E0B] text-[11px] font-black tracking-wider px-3 py-1 rounded-full mb-3 uppercase">
            THINKBIN APP
          </span>
          <h1 className="font-fredoka font-black text-[26px] text-[#0F172A] leading-tight mb-2.5">
            Selamat Datang di ThinkBin!
          </h1>
          <p className="font-nunito font-semibold text-[14.5px] text-[#64748B] leading-relaxed px-2">
            Belajar memilah sampah cerdas, kumpulkan poin, dan raih rank tertinggi bersama teman sekelasmu!
          </p>
        </div>
      </div>

      {/* Google OAuth ONLY Button */}
      <div className="mt-auto flex flex-col items-center gap-3 pb-2.5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-14 bg-white border-[2.5px] border-[#2B2B2B] rounded-[20px] shadow-[0_4px_0_#2B2B2B] active:translate-y-[3px] active:shadow-[0_1px_0_#2B2B2B] flex items-center justify-center gap-3 cursor-pointer transition-all"
        >
          {/* Google Official SVG Icon */}
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24">
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
          <span className="font-fredoka font-extrabold text-[17px] text-[#1E293B] tracking-wide">
            Google
          </span>
        </button>
        <span className="font-nunito font-bold text-xs text-[#94A3B8] text-center">
          Masuk cepat dan aman menggunakan akun Google
        </span>
      </div>
    </div>
  );
}
