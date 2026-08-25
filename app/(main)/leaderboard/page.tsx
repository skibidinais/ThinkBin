"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { fetchLiveLeaderboard } from "@/lib/supabase";
import { UserProfile } from "@/types";

const CLASSES = ["ALL", "8A", "8C", "8E", "9C", "9E", "9F"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [leaderboardData, setLeaderboardData] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchLiveLeaderboard(selectedClass);
      setLeaderboardData(data);
      setIsLoading(false);
    }
    loadData();
  }, [selectedClass]);

  const top1 = leaderboardData[0] || null;
  const top2 = leaderboardData[1] || null;
  const top3 = leaderboardData[2] || null;
  const restList = leaderboardData.slice(3);

  return (
    <div className="relative flex flex-col min-h-full pb-24 select-none bg-gradient-to-b from-[#bfe8ff] via-[#dff2ff] to-[#FFFBEA]">
      {/* ANIMATED SKY CLOUDS */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-6 left-2 w-24 h-8 bg-white rounded-full opacity-90 filter drop-shadow-sm animate-pulse" />
        <div className="absolute top-14 right-4 w-32 h-10 bg-white rounded-full opacity-85 filter drop-shadow-sm" />
        <div className="absolute top-28 left-16 w-20 h-6 bg-white rounded-full opacity-75 filter drop-shadow-sm" />
      </div>

      <div className="relative z-10 px-4 pt-3">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-fredoka font-black text-2xl text-[#0F172A] tracking-tight">
            Leaderboard
          </h1>
          <div className="flex items-center gap-2">
            {/* Coin Pill */}
            <div className="flex items-center gap-1.5 bg-white border-[2px] border-[#FBBF24] px-3 py-1 rounded-full shadow-[0_3px_0_#F59E0B]">
              <Image src="/assets_game/coin.png" alt="Coin" width={18} height={18} className="object-contain" />
              <span className="font-fredoka font-bold text-xs text-[#334155]">
                {user?.coins ?? 0}
              </span>
            </div>

            {/* XP Pill */}
            <div className="flex items-center gap-1.5 bg-white border-[2px] border-[#FDE047] px-3 py-1 rounded-full shadow-[0_3px_0_#EAB308]">
              <Image src="/assets_game/exp_progress.png" alt="XP" width={16} height={16} className="object-contain" />
              <span className="font-fredoka font-bold text-xs text-[#334155]">
                {user?.xp ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* CLASS SELECTOR PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`px-3.5 py-1.5 rounded-full font-fredoka font-bold text-xs whitespace-nowrap transition-all border-[2px] cursor-pointer ${
                selectedClass === cls
                  ? "bg-[#0284C7] text-white border-[#0369A1] shadow-[0_3px_0_#0369A1]"
                  : "bg-white text-[#475569] border-[#E2E8F0] shadow-xs hover:bg-[#F1F5F9]"
              }`}
            >
              {cls === "ALL" ? "Semua Kelas" : `Kelas ${cls}`}
            </button>
          ))}
        </div>

        {/* TOP 3 PODIUM TREE STUMPS */}
        <div className="flex items-end justify-center gap-2 mt-12 mb-6">
          {/* RANK 2: LEONARDO (Left Stump) */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-20 h-20 -mb-4 z-20">
              <Image
                src="/assets/mascot_leonardo.png"
                alt="Rank 2"
                width={80}
                height={80}
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Tree Stump */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner" />
              <div className="w-full h-28 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_4px_0_8px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#f8fafc] to-[#94a3b8] border-2 border-white flex items-center justify-center font-fredoka font-black text-sm text-[#334155] shadow-md mb-1">
                  2
                </div>
                <span className="font-fredoka font-bold text-xs text-white truncate max-w-[85px]">
                  {top2 ? top2.display_name : "Leonardo"}
                </span>
                <span className="font-fredoka font-bold text-[10px] text-[#FEF08A] flex items-center gap-1">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={10} height={10} />
                  {top2 ? `${top2.xp} XP` : "0 XP"}
                </span>
              </div>
            </div>
          </div>

          {/* RANK 1: MAX (Center Tallest Stump) */}
          <div className="flex-1 flex flex-col items-center z-30">
            <div className="relative w-24 h-24 -mb-5 z-20">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow">
                👑
              </span>
              <Image
                src="/assets/mascot_max.png"
                alt="Rank 1"
                width={96}
                height={96}
                className="object-contain drop-shadow-lg"
              />
            </div>
            {/* Tree Stump Tall */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner" />
              <div className="w-full h-36 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_4px_0_8px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#fef08a] to-[#f59e0b] border-2 border-white flex items-center justify-center font-fredoka font-black text-base text-[#78350f] shadow-md mb-1 animate-pulse">
                  1
                </div>
                <span className="font-fredoka font-bold text-xs text-white truncate max-w-[90px]">
                  {top1 ? top1.display_name : "Max"}
                </span>
                <span className="font-fredoka font-bold text-[11px] text-[#FEF08A] flex items-center gap-1">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={12} height={12} />
                  {top1 ? `${top1.xp} XP` : "0 XP"}
                </span>
              </div>
            </div>
          </div>

          {/* RANK 3: SUSAN (Right Stump) */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-20 h-20 -mb-4 z-20">
              <Image
                src="/assets/mascot_susan.png"
                alt="Rank 3"
                width={80}
                height={80}
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Tree Stump */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner" />
              <div className="w-full h-24 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_4px_0_8px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#fed7aa] to-[#ea580c] border-2 border-white flex items-center justify-center font-fredoka font-black text-sm text-white shadow-md mb-1">
                  3
                </div>
                <span className="font-fredoka font-bold text-xs text-white truncate max-w-[85px]">
                  {top3 ? top3.display_name : "Susan"}
                </span>
                <span className="font-fredoka font-bold text-[10px] text-[#FEF08A] flex items-center gap-1">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={10} height={10} />
                  {top3 ? `${top3.xp} XP` : "0 XP"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RANK LIST 4+ */}
        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            <div className="p-4 bg-white/80 rounded-2xl text-center font-fredoka text-xs text-[#64748B]">
              Memuat data peringkat...
            </div>
          ) : restList.length === 0 ? (
            <div className="p-4 bg-white border-[2.5px] border-[#382C22] rounded-2xl text-center font-fredoka text-xs text-[#796F65] shadow-[0_3px_0_#382C22]">
              Belum ada siswa lain di kelas ini. Yuk mulai belajar dan kumpulkan XP!
            </div>
          ) : (
            restList.map((st, index) => (
              <div
                key={st.id || index}
                className="flex items-center gap-3 bg-white border-[2.5px] border-[#382C22] rounded-2xl p-3 shadow-[0_3px_0_#382C22]"
              >
                <span className="font-fredoka font-black text-sm text-[#382C22] w-6 text-center">
                  #{index + 4}
                </span>

                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src="/assets/mascot_leonardo.png"
                    alt={st.display_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  {st.selected_frame && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Image
                        src={`/assets_game/${st.selected_frame}.png`}
                        alt="Frame"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-fredoka font-bold text-xs text-[#382C22] truncate">
                    {st.display_name}
                  </span>
                  <span className="font-nunito font-semibold text-[10px] text-[#796F65]">
                    Kelas {st.class_name} • Absen #{st.student_number}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#FDE8A5] border border-[#D39A1C] px-2.5 py-1 rounded-xl">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={14} height={14} />
                  <span className="font-fredoka font-extrabold text-xs text-[#15803D]">
                    {st.xp} XP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
