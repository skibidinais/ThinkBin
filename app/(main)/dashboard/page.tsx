"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full min-h-full px-4 pt-3 pb-[88px] select-none bg-cover bg-center bg-no-repeat overflow-y-auto no-scrollbar"
      style={{ backgroundImage: "url('/screens_assets/background.png')" }}
    >
      {/* DYNAMIC MOVING CLOUDS OVER SKY */}
      <div className="absolute top-0 left-0 right-0 h-36 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-2 left-3 w-24 h-8 bg-white/90 rounded-full opacity-90 filter drop-shadow-sm animate-pulse" />
        <div className="absolute top-8 right-5 w-18 h-7 bg-white/85 rounded-full opacity-85 filter drop-shadow-sm" />
        <div className="absolute top-16 left-20 w-14 h-5 bg-white/80 rounded-full opacity-80 filter drop-shadow-sm" />
      </div>

      {/* 1. HERO LOGO & MASCOT SECTION (Reduced vertical spacing to fit mobile viewport) */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-1 pb-1 flex-shrink-0">
        <div
          className="relative w-full max-w-[240px] xs:max-w-[260px] cursor-pointer transition-transform active:scale-95 animate-bounce"
          style={{ animationDuration: "4s" }}
        >
          <Image
            src="/screens_assets/logo.png"
            alt="Think Bin Official 3D Logo and Mascot"
            width={260}
            height={165}
            className="w-full h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
            priority
          />
        </div>
      </div>

      {/* 2. BALANCED & VERTICALLY CENTERED ACTION BUTTON GROUP */}
      <div className="relative z-20 w-full max-w-[310px] mx-auto flex-1 flex flex-col items-center justify-center gap-2.5 my-auto">
        {/* BIG GREEN 3D PLAY BUTTON */}
        <button
          type="button"
          onClick={() => router.push("/belajar")}
          className="w-full max-w-[230px] h-[52px] bg-gradient-to-b from-[#97db2f] via-[#83c623] to-[#6fb016] text-white font-fredoka font-black text-[26px] rounded-[20px] shadow-[0_5px_0_#4f870e,0_8px_12px_rgba(0,0,0,0.16)] active:translate-y-1 active:shadow-[0_2px_0_#4f870e] transition-all flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden flex-shrink-0"
        >
          {/* Gloss highlight */}
          <div className="absolute top-1 left-2 right-2 h-[38%] bg-gradient-to-b from-white/45 to-transparent rounded-t-[12px] pointer-events-none" />
          <span className="text-xl drop-shadow">▶</span>
          <span className="drop-shadow-md tracking-wide">play</span>
        </button>

        {/* MISI HARIAN (White Card with Green 3.5px Hard Border) */}
        <Link
          href="/mission"
          className="w-full h-[52px] bg-white border-[3px] border-[#65a35b] rounded-[22px] px-4 flex items-center justify-center gap-3 shadow-[0_5px_0_#528c49,0_8px_16px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#528c49] transition-all cursor-pointer flex-shrink-0"
        >
          <div className="w-8 h-8 bg-gradient-to-b from-[#7cbd73] to-[#65a35b] border-[2px] border-[#a3cca0] rounded-xl flex items-center justify-center shadow-[0_2px_0_#4e8245] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" stroke="#ffffff" strokeWidth="3" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-fredoka font-black text-[19px] text-[#2e5926] tracking-wide">
            Misi Harian
          </span>
        </Link>

        {/* KUISIONER AKHIR (Gold Yellow Card with Dark Gold Border) */}
        <Link
          href="/kuisioner?type=akhir"
          className="w-full min-h-[52px] py-1 bg-gradient-to-b from-[#fff3cd] to-[#fde047] border-[3px] border-[#ca8a04] rounded-[22px] px-4 flex items-center justify-center gap-3 shadow-[0_5px_0_#a16207,0_8px_16px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#a16207] transition-all cursor-pointer flex-shrink-0"
        >
          <div className="w-8 h-8 bg-[#eab308] border-[2px] border-[#ca8a04] rounded-xl flex items-center justify-center shadow-[0_2px_0_#a16207] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="#713f12"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-fredoka font-black text-[15px] text-[#713f12] leading-tight">
              Kuisioner Akhir
            </span>
            <span className="font-fredoka font-bold text-[9.5px] text-[#854d0e] leading-tight mt-0.5">
              Bisa dikerjakan kapan saja (+40 XP, +50 Koin)
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
