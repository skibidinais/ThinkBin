"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="relative flex flex-col items-center justify-between min-h-full px-4 pt-3 pb-10 select-none text-center">
      {/* Top Banner Tag */}
      <div className="w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 bg-[#FFF9E6] border-[2px] border-[#F5B82E] px-3.5 py-1 rounded-full shadow-xs mb-3">
          <span className="text-xs">🌿</span>
          <span className="font-fredoka font-bold text-xs text-[#713F12]">
            ThinkBin SMPN 20 Malang
          </span>
        </div>

        {/* Mascot / Main Logo Section */}
        <div className="relative w-48 h-48 my-1 flex items-center justify-center">
          <Image
            src="/assets/mascot_leonardo.png"
            alt="Think Bin Mascot"
            width={180}
            height={180}
            className="object-contain drop-shadow-lg animate-bounce"
            style={{ animationDuration: "3.5s" }}
            priority
          />
        </div>

        <h1 className="font-fredoka font-black text-2xl text-[#382C22] mb-1 leading-tight">
          Halo, {user?.display_name?.split(" ")[0] || "Teman"}! 👋
        </h1>
        <p className="font-nunito font-bold text-xs text-[#796F65] max-w-[290px] leading-relaxed">
          Pilah sampah cerdas, kumpulkan koin reward, dan raih rank tertinggi di kelasmu!
        </p>
      </div>

      {/* Main Action Section: BIG GREEN PLAY BUTTON & SHORTCUTS */}
      <div className="w-full max-w-[320px] flex flex-col gap-3 my-4">
        {/* Big Play Primary Button */}
        <Link
          href="/belajar"
          className="w-full h-15 bg-[#58CC02] hover:bg-[#4CAF00] text-white font-fredoka font-black text-xl rounded-2xl border-[3px] border-[#4CAF00] border-b-[6px] shadow-lg active:translate-y-1 active:shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider"
        >
          <span className="text-2xl">▶</span>
          <span>MULAI BELAJAR</span>
        </Link>

        {/* Misi Harian Button */}
        <Link
          href="/mission"
          className="w-full p-3 bg-white border-[2.5px] border-[#E5E5E5] border-b-[5px] rounded-2xl shadow-xs hover:bg-gray-50 active:translate-y-0.5 transition-all flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8A62DC] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
            🎯
          </div>
          <div className="flex flex-col">
            <span className="font-fredoka font-black text-sm text-[#382C22] leading-tight">
              Misi Harian
            </span>
            <span className="font-nunito font-bold text-[11px] text-[#796F65]">
              Selesaikan target & klaim koin
            </span>
          </div>
        </Link>

        {/* Kuisioner Akhir Button */}
        <Link
          href="/kuisioner?type=akhir"
          className="w-full p-3 bg-gradient-to-r from-[#FFF9E6] to-[#FEF3C7] border-[2.5px] border-[#F5B82E] border-b-[5px] rounded-2xl shadow-xs hover:brightness-98 active:translate-y-0.5 transition-all flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAB308] text-[#713F12] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
            📝
          </div>
          <div className="flex flex-col">
            <span className="font-fredoka font-black text-sm text-[#713F12] leading-tight">
              Kuisioner Evaluasi Akhir
            </span>
            <span className="font-nunito font-bold text-[11px] text-[#854D0E]">
              Bisa dikerjakan kapan saja (+40 XP, +50 Koin)
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
