"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full min-h-screen px-4 pt-6 pb-24 select-none bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/screens_assets/background.png')" }}
    >
      {/* DYNAMIC MOVING CLOUDS OVER SKY */}
      <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-3 left-2 w-28 h-10 bg-white/90 rounded-full opacity-90 filter drop-shadow-sm animate-pulse" />
        <div className="absolute top-10 right-4 w-20 h-8 bg-white/85 rounded-full opacity-85 filter drop-shadow-sm" />
        <div className="absolute top-20 left-24 w-16 h-6 bg-white/80 rounded-full opacity-80 filter drop-shadow-sm" />
      </div>

      {/* 1. MAIN 3D THINKBIN LOGO & MASCOT SECTION (Upper Half - Exactly like Foto 2) */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-1">
        <div
          className="relative w-full max-w-[340px] px-1 cursor-pointer transition-transform active:scale-95 animate-bounce"
          style={{ animationDuration: "4s" }}
        >
          <Image
            src="/screens_assets/logo.png"
            alt="Think Bin Official 3D Logo and Mascot"
            width={340}
            height={220}
            className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
            priority
          />
        </div>
      </div>

      {/* 2. MAIN ACTION BUTTONS (Lower Half - Stacked tightly above Bottom Dock) */}
      <div className="relative z-20 w-full flex flex-col items-center gap-2.5 pb-2">
        {/* BIG GREEN 3D PLAY BUTTON */}
        <button
          type="button"
          onClick={() => router.push("/belajar")}
          className="w-full max-w-[270px] h-[64px] bg-gradient-to-b from-[#97db2f] via-[#83c623] to-[#6fb016] text-white font-fredoka font-black text-[32px] rounded-[22px] shadow-[0_6px_0_#4f870e,0_10px_14px_rgba(0,0,0,0.16)] active:translate-y-1 active:shadow-[0_2px_0_#4f870e] transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden"
        >
          {/* Top gloss highlight */}
          <div className="absolute top-1 left-2 right-2 h-[40%] bg-gradient-to-b from-white/45 to-transparent rounded-t-[14px] pointer-events-none" />
          <span className="text-2xl drop-shadow">▶</span>
          <span className="drop-shadow-md">play</span>
        </button>

        {/* MISI HARIAN (White Card with Green 3.5px Hard Border) */}
        <Link
          href="/mission"
          className="w-full min-h-[64px] bg-white border-[3.5px] border-[#65a35b] rounded-[26px] px-5 py-2 flex items-center justify-center gap-3.5 shadow-[0_6px_0_#528c49,0_10px_20px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#528c49] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-b from-[#7cbd73] to-[#65a35b] border-[2.5px] border-[#a3cca0] rounded-2xl flex items-center justify-center shadow-[0_3px_0_#4e8245] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" stroke="#ffffff" strokeWidth="3" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-fredoka font-black text-[22px] text-[#2e5926] tracking-wide">
            Misi Harian
          </span>
        </Link>

        {/* KUISIONER AKHIR (Gold Yellow Card with Dark Gold Border) */}
        <Link
          href="/kuisioner?type=akhir"
          className="w-full min-h-[64px] bg-gradient-to-b from-[#fff3cd] to-[#fde047] border-[3.5px] border-[#ca8a04] rounded-[26px] px-5 py-1.5 flex items-center justify-center gap-3.5 shadow-[0_6px_0_#a16207,0_10px_20px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#a16207] transition-all cursor-pointer"
        >
          <div className="w-9 h-9 bg-[#eab308] border-[2px] border-[#ca8a04] rounded-2xl flex items-center justify-center shadow-[0_2px_0_#a16207] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
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
            <span className="font-fredoka font-black text-base text-[#713f12] leading-tight">
              Kuisioner Akhir
            </span>
            <span className="font-fredoka font-bold text-[10px] text-[#854d0e] leading-tight mt-0.5">
              Bisa dikerjakan kapan saja (+40 XP, +50 Koin)
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
