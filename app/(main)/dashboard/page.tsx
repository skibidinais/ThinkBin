"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div
      className="relative flex flex-col justify-between min-h-full px-3.5 pt-2 pb-24 select-none bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/screens_assets/background.png')" }}
    >
      {/* DYNAMIC MOVING CLOUDS OVER SKY */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-4 left-2 w-28 h-10 bg-white/90 rounded-full opacity-90 filter drop-shadow-sm animate-pulse" />
        <div className="absolute top-12 right-4 w-20 h-8 bg-white/85 rounded-full opacity-85 filter drop-shadow-sm" />
        <div className="absolute top-24 left-20 w-16 h-6 bg-white/80 rounded-full opacity-80 filter drop-shadow-sm" />
      </div>

      {/* TOP EMPTY SPACE */}
      <div className="w-full h-2 z-10" />

      {/* MAIN 3D THINKBIN LOGO & MASCOT SECTION (Foto 2) */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative w-full max-w-[340px] px-2 cursor-pointer transition-transform active:scale-95 animate-bounce" style={{ animationDuration: "4s" }}>
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

      {/* MAIN ACTION SECTION (Foto 2) */}
      <div className="relative z-20 w-full flex flex-col items-center gap-3">
        {/* BIG GREEN 3D PLAY BUTTON */}
        <button
          type="button"
          onClick={() => router.push("/belajar")}
          className="w-full max-w-[280px] h-16 bg-gradient-to-b from-[#97db2f] via-[#83c623] to-[#6fb016] text-white font-fredoka font-black text-3xl rounded-[22px] shadow-[0_6px_0_#4f870e,0_10px_14px_rgba(0,0,0,0.16)] active:translate-y-1 active:shadow-[0_2px_0_#4f870e] transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden"
        >
          {/* Top gloss highlight */}
          <div className="absolute top-1 left-2 right-2 h-[40%] bg-gradient-to-b from-white/45 to-transparent rounded-t-[14px] pointer-events-none" />
          <span className="text-2xl drop-shadow">▶</span>
          <span className="drop-shadow-md">play</span>
        </button>

        {/* MISI HARIAN (Foto 2: White Card with Green Border) */}
        <Link
          href="/mission"
          className="w-full min-h-[66px] bg-white border-[3.5px] border-[#65a35b] rounded-[26px] px-5 py-2.5 flex items-center justify-center gap-4 shadow-[0_6px_0_#528c49,0_10px_20px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#528c49] transition-all cursor-pointer"
        >
          <div className="w-11 h-11 bg-gradient-to-b from-[#7cbd73] to-[#65a35b] border-[2.5px] border-[#a3cca0] rounded-2xl flex items-center justify-center shadow-[0_3px_0_#4e8245] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" stroke="#ffffff" strokeWidth="3" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-fredoka font-black text-2xl text-[#2e5926] tracking-wide">
            Misi Harian
          </span>
        </Link>

        {/* KUISIONER AKHIR (Foto 2: Yellow Gold Card) */}
        <Link
          href="/kuisioner?type=akhir"
          className="w-full min-h-[66px] bg-gradient-to-b from-[#fff3cd] to-[#fde047] border-[3.5px] border-[#ca8a04] rounded-[26px] px-5 py-2 flex items-center justify-center gap-3.5 shadow-[0_6px_0_#a16207,0_10px_20px_rgba(0,0,0,0.12)] active:translate-y-1 active:shadow-[0_2px_0_#a16207] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#eab308] border-[2px] border-[#ca8a04] rounded-2xl flex items-center justify-center shadow-[0_2px_0_#a16207] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
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
            <span className="font-fredoka font-black text-lg text-[#713f12] leading-tight">
              Kuisioner Akhir
            </span>
            <span className="font-fredoka font-bold text-[11px] text-[#854d0e] leading-tight mt-0.5">
              Bisa dikerjakan kapan saja (+40 XP, +50 Koin)
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
