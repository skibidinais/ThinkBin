"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  fetchLiveLeaderboard,
  fetchLiveClassLeaderboard,
  ClassLeaderboardItem,
} from "@/lib/supabase";
import { UserProfile } from "@/types";

type LeaderboardTab = "individu" | "kelas";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  xp: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("individu");
  const [individualData, setIndividualData] = useState<UserProfile[]>([]);
  const [classData, setClassData] = useState<ClassLeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [users, classes] = await Promise.all([
          fetchLiveLeaderboard(),
          fetchLiveClassLeaderboard(),
        ]);
        setIndividualData(users);
        setClassData(classes);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Transform data based on active tab
  const entries: LeaderboardEntry[] =
    activeTab === "individu"
      ? (individualData.length > 0
          ? individualData
          : user
          ? [user]
          : []
        ).map((u, index) => ({
          id: u.id,
          rank: index + 1,
          name: u.display_name?.split(" ")[0] || "Siswa",
          xp: u.xp || 0,
          isCurrentUser: u.id === user?.id,
        }))
      : (classData.length > 0
          ? classData
          : user?.class_name
          ? [
              {
                class_name: `Kelas ${user.class_name}`,
                total_xp: user.xp || 0,
                student_count: 1,
              },
            ]
          : []
        ).map((c, index) => ({
          id: c.class_name,
          rank: index + 1,
          name: c.class_name.startsWith("Kelas") ? c.class_name : `Kelas ${c.class_name}`,
          xp: c.total_xp || 0,
          isCurrentUser: user?.class_name
            ? c.class_name.includes(user.class_name)
            : false,
        }));

  // Podium entries
  const top1 = entries.find((e) => e.rank === 1) || null;
  const top2 = entries.find((e) => e.rank === 2) || null;
  const top3 = entries.find((e) => e.rank === 3) || null;

  // Ranked List: #4 onward
  const restEntries = entries.filter((e) => e.rank >= 4);

  return (
    <div className="relative flex flex-col min-h-full pb-28 select-none bg-gradient-to-b from-[#aee0fd] via-[#d7f0fd] to-[#ebf7ff] overflow-y-auto no-scrollbar">
      {/* ── 1. ANIMATED CLOUDS SKY BACKDROP ── */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-3 left-3 w-28 h-9 bg-white/90 rounded-full opacity-90 filter drop-shadow-sm animate-pulse" />
        <div className="absolute top-10 right-4 w-36 h-11 bg-white/85 rounded-full opacity-85 filter drop-shadow-sm" />
        <div className="absolute top-24 left-16 w-24 h-7 bg-white/80 rounded-full opacity-80 filter drop-shadow-sm" />
      </div>

      <div className="relative z-10 px-4 pt-3">
        {/* ── 2. HEADER (Title & Stat Pills) ── */}
        <header className="flex items-center justify-between mb-3">
          <h1 className="font-fredoka font-black text-[26px] text-[#0f172a] tracking-tight drop-shadow-xs">
            Leaderboard
          </h1>

          <div className="flex items-center gap-2">
            {/* Coins Pill */}
            <div className="flex items-center gap-1.5 bg-white border-2 border-[#fbbf24] rounded-full px-3 py-1 shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={18}
                height={18}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-sm text-[#334155]">
                {user?.coins ?? 640}
              </span>
            </div>

            {/* XP Pill */}
            <div className="flex items-center gap-1.5 bg-white border-2 border-[#fde047] rounded-full px-3 py-1 shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
              <Image
                src="/assets_game/exp_progress.png"
                alt="XP"
                width={16}
                height={16}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-sm text-[#334155]">
                {user?.xp ?? 252}
              </span>
            </div>
          </div>
        </header>

        {/* ── 3. VIEW TOGGLE (2 PILIHAN: INDIVIDU vs KELAS) ── */}
        <div className="w-full max-w-[280px] mx-auto bg-white/80 p-1 rounded-full border-2 border-[#7dd3fc] shadow-sm flex items-center justify-between mb-6 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setActiveTab("individu")}
            className={`flex-1 py-1.5 rounded-full font-fredoka font-black text-xs text-center transition-all cursor-pointer ${
              activeTab === "individu"
                ? "bg-[#0284c7] text-white shadow-[0_2px_6px_rgba(2,132,199,0.35)]"
                : "text-[#475569] hover:text-[#0f172a]"
            }`}
          >
            Individu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kelas")}
            className={`flex-1 py-1.5 rounded-full font-fredoka font-black text-xs text-center transition-all cursor-pointer ${
              activeTab === "kelas"
                ? "bg-[#0284c7] text-white shadow-[0_2px_6px_rgba(2,132,199,0.35)]"
                : "text-[#475569] hover:text-[#0f172a]"
            }`}
          >
            Kelas
          </button>
        </div>

        {/* ── 4. 3 TREE STUMP PODIUM STAGE ── */}
        <div className="relative flex items-end justify-center gap-2 mb-0">
          {/* RANK 2: LEFT STUMP (LEONARDO) */}
          <div className="flex-1 flex flex-col items-center">
            {/* Mascot Rank 2 */}
            <div className="relative w-20 h-20 -mb-3 z-20">
              <Image
                src="/screens_assets/mascot_thumbsup_transparent.png"
                alt="Rank 2 Mascot"
                width={80}
                height={80}
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Tree Stump */}
            <div className="w-full flex flex-col items-center relative">
              {/* Annual Rings Top */}
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner flex items-center justify-center">
                <div className="w-3/5 h-1/2 border border-[#8a4d1e]/40 rounded-full" />
              </div>
              {/* Stump Bark */}
              <div className="w-full h-28 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-6px_0_10px_rgba(0,0,0,0.25),inset_6px_0_10px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white relative">
                {/* Sprout Branch */}
                <div className="absolute top-8 -left-3 flex items-center -rotate-20 z-20 pointer-events-none">
                  <div className="w-3 h-1 bg-[#78350f] rounded-full" />
                  <div className="w-3 h-2 bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] rounded-tr-md rounded-bl-md shadow-xs -mt-1 -ml-1" />
                </div>
                {/* Medal 2 */}
                <div className="w-8 h-8 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fed7aa_0%,#ea580c_55%,#9a3412_100%)] border-[2.5px] border-[#9a3412] flex items-center justify-center font-fredoka font-black text-sm text-white shadow-md mb-1">
                  2
                </div>
                <span className="font-fredoka font-black text-[13px] text-white truncate max-w-[85px] text-center drop-shadow-sm">
                  {top2 ? top2.name : "-"}
                </span>
                <span className="font-fredoka font-bold text-[11px] text-[#FEF08A] flex items-center gap-0.5 mt-0.5 drop-shadow-sm">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={11} height={11} />
                  {top2 ? `${top2.xp} XP` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* RANK 1: CENTER TALLEST STUMP (MAX) */}
          <div className="flex-1 flex flex-col items-center z-30">
            {/* Mascot Rank 1 + Crown */}
            <div className="relative w-24 h-24 -mb-3.5 z-20 flex items-center justify-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow animate-bounce" style={{ animationDuration: "3s" }}>
                👑
              </span>
              <Image
                src="/screens_assets/mascot_cheer.jpg"
                alt="Rank 1 Mascot"
                width={88}
                height={88}
                className="object-contain drop-shadow-lg rounded-full"
              />
            </div>
            {/* Tree Stump Tall */}
            <div className="w-full flex flex-col items-center relative">
              {/* Annual Rings Top */}
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner flex items-center justify-center">
                <div className="w-3/5 h-1/2 border border-[#8a4d1e]/40 rounded-full" />
              </div>
              {/* Stump Bark */}
              <div className="w-full h-36 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl flex flex-col items-center pt-3.5 pb-2 px-1 shadow-[inset_-6px_0_10px_rgba(0,0,0,0.25),inset_6px_0_10px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white relative">
                {/* Gold Medal 1 */}
                <div className="w-9 h-9 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fef08a_0%,#f59e0b_50%,#b45309_100%)] border-[2.5px] border-[#d97706] flex items-center justify-center font-fredoka font-black text-base text-white shadow-md mb-1 animate-pulse">
                  1
                </div>
                <span className="font-fredoka font-black text-[13.5px] text-white truncate max-w-[90px] text-center drop-shadow-sm">
                  {top1 ? top1.name : "Juara 1"}
                </span>
                <span className="font-fredoka font-bold text-xs text-[#FEF08A] flex items-center gap-0.5 mt-0.5 drop-shadow-sm">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={12} height={12} />
                  {top1 ? `${top1.xp} XP` : "0 XP"}
                </span>
              </div>
            </div>
          </div>

          {/* RANK 3: RIGHT STUMP (SUSAN) */}
          <div className="flex-1 flex flex-col items-center">
            {/* Mascot Rank 3 + Floating Hearts */}
            <div className="relative w-20 h-20 -mb-3 z-20">
              <div className="absolute -top-2 right-0 text-xs animate-ping">❤️</div>
              <Image
                src="/screens_assets/mascot_wink.png"
                alt="Rank 3 Mascot"
                width={80}
                height={80}
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Tree Stump */}
            <div className="w-full flex flex-col items-center relative">
              {/* Annual Rings Top */}
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner flex items-center justify-center">
                <div className="w-3/5 h-1/2 border border-[#8a4d1e]/40 rounded-full" />
              </div>
              {/* Stump Bark */}
              <div className="w-full h-24 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-6px_0_10px_rgba(0,0,0,0.25),inset_6px_0_10px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white relative">
                {/* Sprout Branch */}
                <div className="absolute top-7 -right-3 flex items-center rotate-20 z-20 pointer-events-none">
                  <div className="w-3 h-1 bg-[#78350f] rounded-full" />
                  <div className="w-3 h-2 bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] rounded-tl-md rounded-br-md shadow-xs -mt-1 -mr-1" />
                </div>
                {/* Bronze Medal 3 */}
                <div className="w-8 h-8 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#cbd5e1_55%,#64748b_100%)] border-[2.5px] border-[#94a3b8] flex items-center justify-center font-fredoka font-black text-sm text-[#334155] shadow-md mb-1">
                  3
                </div>
                <span className="font-fredoka font-black text-[13px] text-white truncate max-w-[85px] text-center drop-shadow-sm">
                  {top3 ? top3.name : "-"}
                </span>
                <span className="font-fredoka font-bold text-[11px] text-[#FEF08A] flex items-center gap-0.5 mt-0.5 drop-shadow-sm">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={11} height={11} />
                  {top3 ? `${top3.xp} XP` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. SCALLOPED CLOUD DIVIDER ── */}
        <div className="relative w-[calc(100%+32px)] -ml-4 h-6 -mt-2 z-20">
          <svg viewBox="0 0 375 28" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0 28H375V16C360 16 352 6 338 6C324 6 316 16 302 16C288 16 280 6 266 6C252 6 244 16 230 16C216 16 208 6 194 6C180 6 172 16 158 16C144 16 136 6 122 6C108 6 100 16 86 16C72 16 64 6 50 6C36 6 28 16 14 16C6 16 0 12 0 12V28Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── 6. RANKED LIST CARD (#4 ONWARD) ── */}
        <div className="relative z-20 w-[calc(100%+32px)] -ml-4 bg-white rounded-b-[28px] px-4 pt-2 pb-6 shadow-[0_10px_25px_rgba(15,23,42,0.05)] flex flex-col gap-1">
          {restEntries.length > 0 ? (
            restEntries.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                  item.isCurrentUser
                    ? "bg-[#e0f2fe] shadow-[0_2px_8px_rgba(2,132,199,0.08)]"
                    : "hover:bg-[#f8fafc]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Silver Disc Badge */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white via-[#cbd5e1] to-[#94a3b8] border-2 border-[#94a3b8] flex items-center justify-center font-fredoka font-black text-xs text-[#334155] shadow-xs flex-shrink-0">
                    {item.rank}
                  </div>
                  <span
                    className={`font-fredoka font-black text-sm ${
                      item.isCurrentUser ? "text-[#0284c7]" : "text-[#0f172a]"
                    }`}
                  >
                    {item.name} {item.isCurrentUser && "(You)"}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-fredoka font-black text-xs text-[#059669]">
                  <Image
                    src="/assets_game/exp_progress.png"
                    alt="XP"
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                  <span>{item.xp} XP</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 px-3 text-center flex flex-col items-center">
              <span className="text-2xl mb-1">🌿</span>
              <p className="font-fredoka font-bold text-xs text-[#64748b] max-w-[240px]">
                {activeTab === "individu"
                  ? "Belum ada siswa lain di peringkat 4 ke bawah. Selesaikan misi & raih posisi teratas!"
                  : "Belum ada data kelas lain. Ajak teman sekelasmu belajar bersama!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
