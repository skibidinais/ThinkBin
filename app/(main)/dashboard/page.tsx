"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      refreshProfile(user.id).catch(() => {});
    }
    // Unlock target date: August 28, 2026 (Month is 0-indexed: 7 is August)
    const unlockDate = new Date(2026, 7, 28, 0, 0, 0);
    const now = new Date();
    setIsLocked(now < unlockDate);
  }, [user?.id]);

  const handleKuisionerClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      setToastMessage("Terbuka mulai 28 Agustus 2026");
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-full min-h-0 flex-1 select-none bg-cover bg-center bg-no-repeat pb-[70px] overflow-hidden"
      style={{ backgroundImage: "url('/screens_assets/background.png')" }}
    >
      {/* TOAST ALERT NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1E293B]/95 text-white border-2 border-[#F59E0B] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="font-fredoka font-bold text-sm tracking-wide">
            {toastMessage}
          </span>
        </div>
      )}

      {/* ── 1. HERO: THINKBIN LOGO + MASCOT ── */}
      <div
        className="relative z-10 w-full flex justify-center animate-bounce flex-shrink-0 mb-2"
        style={{ animationDuration: "4s" }}
      >
        <Image
          src="/screens_assets/logo.png"
          alt="ThinkBin Logo and Mascot"
          width={240}
          height={145}
          className="w-[240px] max-w-[66vw] h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
          priority
        />
      </div>

      {/* ── 2. ACTION BUTTONS (perfectly centered directly below the logo) ── */}
      <div className="relative z-20 w-full max-w-[310px] px-4 flex flex-col items-center gap-2 mt-0.5 flex-shrink-0">

        {/* BIG GREEN 3D PLAY BUTTON */}
        <button
          type="button"
          onClick={() => router.push("/belajar")}
          className="w-full h-[54px] bg-gradient-to-b from-[#97db2f] via-[#83c623] to-[#6fb016] text-white font-fredoka font-black text-[28px] rounded-[20px] shadow-[0_5px_0_#4f870e,0_8px_12px_rgba(0,0,0,0.16)] active:translate-y-1 active:shadow-[0_2px_0_#4f870e] transition-all flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-1 left-2 right-2 h-[38%] bg-gradient-to-b from-white/45 to-transparent rounded-t-[12px] pointer-events-none" />
          <span className="text-xl drop-shadow">▶</span>
          <span className="drop-shadow-md tracking-wide">play</span>
        </button>

        {/* MISI HARIAN */}
        <Link
          href="/mission"
          className="w-full h-[52px] bg-white border-[3px] border-[#65a35b] rounded-[22px] px-4 flex items-center justify-center gap-3 shadow-[0_5px_0_#528c49,0_8px_16px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#528c49] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-b from-[#7cbd73] to-[#65a35b] border-[2px] border-[#a3cca0] rounded-xl flex items-center justify-center shadow-[0_2px_0_#4e8245] flex-shrink-0">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" stroke="#ffffff" strokeWidth="3" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-fredoka font-black text-[20px] text-[#2e5926] tracking-wide">
            Misi Harian
          </span>
        </Link>

        {/* ARENA DUEL 1 VS 1 */}
        <Link
          href="/duel"
          className="w-full h-[52px] bg-gradient-to-b from-[#ff7a29] via-[#f95716] to-[#d93806] border-[3px] border-[#8a2202] rounded-[22px] px-4 flex items-center justify-center gap-3 shadow-[0_5px_0_#751900,0_8px_16px_rgba(217,56,6,0.25)] active:translate-y-1 active:shadow-[0_2px_0_#751900] transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-1 left-2 right-2 h-[38%] bg-gradient-to-b from-white/35 to-transparent rounded-t-[12px] pointer-events-none" />
          <div className="w-8 h-8 bg-white/20 border-[2px] border-white/40 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6 2 2-6-4.5-4.5" />
              <path d="M9.5 6.5L17.5 14.5" />
            </svg>
          </div>
          <span className="font-fredoka font-black text-[20px] text-white tracking-wide drop-shadow-md">
            Arena Duel 1 vs 1
          </span>
        </Link>

        {/* KUISIONER AKHIR (Date-Gated: Unlocks on August 28, 2026) */}
        {isLocked ? (
          <button
            type="button"
            onClick={handleKuisionerClick}
            className="w-full h-[52px] bg-gradient-to-b from-[#E2E8F0] to-[#CBD5E1] border-[3px] border-[#94A3B8] rounded-[22px] px-4 flex items-center justify-center gap-3 shadow-[0_5px_0_#64748B,0_8px_16px_rgba(0,0,0,0.1)] active:translate-y-0.5 opacity-90 cursor-pointer flex-shrink-0 relative overflow-hidden"
          >
            <div className="w-8 h-8 bg-[#94A3B8] border-[2px] border-[#64748B] rounded-xl flex items-center justify-center shadow-[0_2px_0_#475569] flex-shrink-0">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-fredoka font-black text-[15px] text-[#475569] leading-tight flex items-center gap-1.5">
                Kuisioner Akhir
                <span className="bg-[#64748B] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">Terkunci</span>
              </span>
              <span className="font-fredoka font-bold text-[9.5px] text-[#64748B] leading-tight mt-0.5">
                Terbuka mulai 28 Agustus 2026
              </span>
            </div>
          </button>
        ) : (
          <Link
            href="/kuisioner?type=akhir"
            className="w-full h-[52px] bg-gradient-to-b from-[#fff3cd] to-[#fde047] border-[3px] border-[#ca8a04] rounded-[22px] px-4 flex items-center justify-center gap-3 shadow-[0_5px_0_#a16207,0_8px_16px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#a16207] transition-all cursor-pointer flex-shrink-0"
          >
            <div className="w-8 h-8 bg-[#eab308] border-[2px] border-[#ca8a04] rounded-xl flex items-center justify-center shadow-[0_2px_0_#a16207] flex-shrink-0">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-fredoka font-black text-[15px] text-[#713f12] leading-tight">Kuisioner Akhir</span>
              <span className="font-fredoka font-bold text-[9.5px] text-[#854d0e] leading-tight mt-0.5">
                Bisa dikerjakan (+40 XP, +50 Koin)
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
