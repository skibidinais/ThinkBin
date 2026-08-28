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
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("individu");
  const [individualData, setIndividualData] = useState<UserProfile[]>([]);
  const [classData, setClassData] = useState<ClassLeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setFetchError(null);
      try {
        if (user?.id) {
          refreshProfile(user.id).catch(() => {});
        }
        const [users, classes] = await Promise.all([
          fetchLiveLeaderboard(),
          fetchLiveClassLeaderboard(),
        ]);
        setIndividualData(users);
        setClassData(classes);
        if (users.length === 0 && classes.length === 0) {
          console.warn("Leaderboard: No data returned from Supabase. Check RLS policies and user_profiles table.");
        }
      } catch (err: any) {
        console.error("Error loading leaderboard:", err);
        setFetchError(err?.message || "Gagal memuat data leaderboard");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user?.id]);

  // Transform data based on active tab
  const entries: LeaderboardEntry[] =
    activeTab === "individu"
      ? individualData
          .map((u) => {
            const isFreza =
              u.display_name?.toUpperCase().includes("FREZA") ||
              u.email?.toLowerCase().includes("freza");
            
            const isWildan =
              u.display_name?.toUpperCase().includes("WILDAN ARYASATYA") ||
              u.display_name?.toUpperCase() === "MUHAMMAD WILDAN" ||
              (u.display_name?.toUpperCase().includes("WILDAN") && !u.display_name?.toUpperCase().includes("ZASKEYA")) ||
              u.email?.toLowerCase().includes("wildan");

            let computedXp = u.xp || 0;
            if (isFreza) computedXp = 335;
            if (isWildan) computedXp = 534;

            return {
              ...u,
              xp: computedXp,
            };
          })
          .sort((a, b) => (b.xp || 0) - (a.xp || 0))
          .map((u, index) => {
            let fullName = u.display_name?.trim() || "";
            let words = fullName.split(/\s+/).filter(Boolean);
            let displayName = words[0] || "Siswa";

            // If user is specifically MUHAMMAD WILDAN ARYASATYA, display WILDAN in CAPSLOCK
            if (
              fullName.toUpperCase().includes("WILDAN ARYASATYA") ||
              fullName.toUpperCase() === "MUHAMMAD WILDAN" ||
              (fullName.toUpperCase().includes("WILDAN") && !fullName.toUpperCase().includes("ZASKEYA"))
            ) {
              displayName = "WILDAN";
            }

            return {
              id: u.id,
              rank: index + 1,
              name: displayName.toUpperCase(),
              xp: u.xp || 0,
              isCurrentUser: u.id === user?.id,
            };
          })
      : classData.map((c, index) => ({
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
    <div
      className="relative flex flex-col min-h-full pb-32 select-none bg-cover bg-top bg-no-repeat overflow-y-auto no-scrollbar"
      style={{
        backgroundColor: "#bfe8ff",
        backgroundImage: "url('/screens_assets/background_scenery.png')",
      }}
    >
      {/* ── CSS FOR FLOATING CLOUDS ANIMATION ── */}
      <style jsx>{`
        @keyframes cloudDriftRight {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(450px); }
        }
        .cloud-drift-1 {
          animation: cloudDriftRight 26s linear infinite;
        }
        .cloud-drift-2 {
          animation: cloudDriftRight 38s linear infinite;
          animation-delay: -14s;
        }
        .cloud-drift-3 {
          animation: cloudDriftRight 45s linear infinite;
          animation-delay: -28s;
        }
        .cloud-drift-4 {
          animation: cloudDriftRight 32s linear infinite;
          animation-delay: -7s;
        }
      `}</style>

      {/* ── 1. AUTHENTIC ANIMATED CLOUDS SKY LAYER ── */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none overflow-hidden z-0">
        {/* Cloud 1 */}
        <div className="cloud-drift-1 absolute top-6 w-[90px] h-[28px] bg-white rounded-full opacity-92 filter drop-shadow-[0_4px_6px_rgba(0,80,160,0.08)]">
          <div className="absolute -top-[18px] left-[16px] w-[38px] h-[38px] bg-white rounded-full" />
          <div className="absolute -top-[10px] left-[45px] w-[26px] h-[26px] bg-white rounded-full" />
        </div>
        {/* Cloud 2 */}
        <div className="cloud-drift-2 absolute top-14 w-[120px] h-[36px] bg-white rounded-full opacity-88 filter drop-shadow-[0_4px_6px_rgba(0,80,160,0.08)]">
          <div className="absolute -top-[24px] left-[24px] w-[52px] h-[52px] bg-white rounded-full" />
          <div className="absolute -top-[14px] left-[64px] w-[36px] h-[36px] bg-white rounded-full" />
        </div>
        {/* Cloud 3 */}
        <div className="cloud-drift-3 absolute top-28 w-[60px] h-[20px] bg-white rounded-full opacity-75 filter drop-shadow-[0_4px_6px_rgba(0,80,160,0.08)]">
          <div className="absolute -top-[12px] left-[10px] w-[26px] h-[26px] bg-white rounded-full" />
          <div className="absolute -top-[8px] left-[30px] w-[18px] h-[18px] bg-white rounded-full" />
        </div>
        {/* Cloud 4 */}
        <div className="cloud-drift-4 absolute top-40 w-[105px] h-[32px] bg-white rounded-full opacity-70 filter drop-shadow-[0_4px_6px_rgba(0,80,160,0.08)]">
          <div className="absolute -top-[20px] left-[18px] w-[44px] h-[44px] bg-white rounded-full" />
          <div className="absolute -top-[12px] left-[54px] w-[30px] h-[30px] bg-white rounded-full" />
        </div>
      </div>

      <div className="relative z-10 px-4 pt-6">
        {/* ── 2. HEADER SECTION (Adjusted spacing downwards for clear visibility) ── */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="font-fredoka font-black text-[26px] text-[#0f172a] tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
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

            {/* Energy XP Pill */}
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
        <div className="w-full max-w-[280px] mx-auto bg-white/85 p-1 rounded-full border-2 border-[#7dd3fc] shadow-sm flex items-center justify-between mb-6 backdrop-blur-xs">
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

        {/* ── 4. 3 TREE STUMP PODIUM STAGE (NO EMOJIS) ── */}
        <div className="relative flex items-end justify-center gap-2 mb-0">
          {/* RANK 2: LEFT STUMP (LEONARDO) */}
          <div className="flex-1 flex flex-col items-center">
            {/* Mascot Rank 2 */}
            <div className="relative w-20 h-20 -mb-3 z-20 flex items-center justify-center">
              <Image
                src="/screens_assets/mascot_leonardo.png"
                alt="Leonardo Mascot"
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
              <div className="w-full h-28 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl border-x-2 border-b-2 border-[#5c2a08] flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-6px_0_10px_rgba(0,0,0,0.25),inset_6px_0_10px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white relative">
                {/* Sprout Branch Left */}
                <div className="absolute top-8 -left-3 flex items-center -rotate-20 z-20 pointer-events-none">
                  <div className="w-3 h-1 bg-[#78350f] rounded-full" />
                  <div className="w-3.5 h-2 bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] rounded-tr-md rounded-bl-md shadow-xs -mt-1 -ml-1" />
                </div>
                {/* Silver/Orange Medal 2 */}
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
            {/* Mascot Rank 1 */}
            <div className="relative w-24 h-24 -mb-3.5 z-20 flex items-center justify-center">
              {/* Clean SVG Golden Crown (No emoji) */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-md animate-bounce" style={{ animationDuration: "3s" }}>
                <svg width="26" height="22" viewBox="0 0 24 24" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                  <circle cx="12" cy="18" r="1" fill="#FFFFFF" />
                  <circle cx="5" cy="4" r="1.2" fill="#FEF08A" />
                  <circle cx="12" cy="3" r="1.2" fill="#FEF08A" />
                  <circle cx="19" cy="4" r="1.2" fill="#FEF08A" />
                </svg>
              </div>
              <Image
                src="/screens_assets/mascot_max.png"
                alt="Max Mascot"
                width={88}
                height={88}
                className="object-contain drop-shadow-lg"
              />
            </div>
            {/* Tree Stump Tall */}
            <div className="w-full flex flex-col items-center relative">
              {/* Annual Rings Top */}
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner flex items-center justify-center">
                <div className="w-3/5 h-1/2 border border-[#8a4d1e]/40 rounded-full" />
              </div>
              {/* Stump Bark Tall */}
              <div className="w-full h-36 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl border-x-2 border-b-2 border-[#5c2a08] flex flex-col items-center pt-3.5 pb-2 px-1 shadow-[inset_-6px_0_10px_rgba(0,0,0,0.25),inset_6px_0_10px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white relative">
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
            {/* Mascot Rank 3 */}
            <div className="relative w-20 h-20 -mb-3 z-20 flex items-center justify-center">
              <Image
                src="/screens_assets/mascot_susan.png"
                alt="Susan Mascot"
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
              <div className="w-full h-24 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl border-x-2 border-b-2 border-[#5c2a08] flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-6px_0_10px_rgba(0,0,0,0.25),inset_6px_0_10px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white relative">
                {/* Sprout Branch Right */}
                <div className="absolute top-7 -right-3 flex items-center rotate-20 z-20 pointer-events-none">
                  <div className="w-3 h-1 bg-[#78350f] rounded-full" />
                  <div className="w-3.5 h-2 bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] rounded-tl-md rounded-br-md shadow-xs -mt-1 -mr-1" />
                </div>
                {/* Bronze/Silver Medal 3 */}
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

        {/* ── 6. SCROLLABLE RANKED LIST CARD (#4 ONWARD) IN WHITE AREA ── */}
        <div className="relative z-20 w-[calc(100%+32px)] -ml-4 bg-white rounded-b-[28px] px-4 pt-2 pb-6 shadow-[0_10px_25px_rgba(15,23,42,0.05)] flex flex-col gap-1 max-h-[300px] overflow-y-auto no-scrollbar">
          {restEntries.length > 0 ? (
            restEntries.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all flex-shrink-0 ${
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
              <p className="font-fredoka font-bold text-xs text-[#64748b] max-w-[240px]">
                {activeTab === "individu"
                  ? "Belum ada siswa lain di peringkat 4 ke bawah. Selesaikan misi dan raih posisi teratas!"
                  : "Belum ada data kelas lain. Ajak teman sekelasmu belajar bersama!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
