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
  avatarSrc?: string;
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
          ? [
              {
                id: user.id,
                nisn: user.nisn || "",
                display_name: user.display_name || "Kamu",
                class_name: user.class_name || "8A",
                xp: user.xp || 0,
                coins: user.coins || 0,
                streak: user.streak || 1,
                selected_frame: user.selected_frame || "eco_green",
                onboarding_completed: true,
              },
            ]
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

  // Podium Entries: #1, #2, #3
  const top1 = entries.find((e) => e.rank === 1) || null;
  const top2 = entries.find((e) => e.rank === 2) || null;
  const top3 = entries.find((e) => e.rank === 3) || null;

  // Ranked List: #4 onward
  const restEntries = entries.filter((e) => e.rank >= 4);

  return (
    <div className="relative flex flex-col min-h-full pb-28 select-none bg-gradient-to-b from-[#87CEEB] via-[#BAE6FD] to-[#FFFBEA]">
      {/* ── 1. ANIMATED CLOUDS SKY BACKGROUND ── */}
      <div className="absolute top-0 left-0 right-0 h-56 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-4 left-3 w-28 h-9 bg-white/90 rounded-full opacity-90 filter drop-shadow-sm animate-pulse" />
        <div className="absolute top-12 right-4 w-36 h-11 bg-white/85 rounded-full opacity-85 filter drop-shadow-sm" />
        <div className="absolute top-28 left-20 w-24 h-7 bg-white/75 rounded-full opacity-75 filter drop-shadow-sm" />
      </div>

      <div className="relative z-10 px-4 pt-3">
        {/* ── 2. HEADER SECTION (Title & Stat Pills) ── */}
        <header className="flex items-center justify-between mb-3.5">
          <h1 className="font-fredoka font-black text-[26px] text-[#0F172A] tracking-tight drop-shadow-xs">
            Papan Peringkat
          </h1>

          <div className="flex items-center gap-2">
            {/* Coin Pill */}
            <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#F59E0B] rounded-full px-3 py-1 shadow-[0_2.5px_0_#D97706]">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={18}
                height={18}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-xs text-[#382C22]">
                {user?.coins ?? 640}
              </span>
            </div>

            {/* XP Pill */}
            <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#22C55E] rounded-full px-3 py-1 shadow-[0_2.5px_0_#16A34A]">
              <Image
                src="/assets_game/exp_progress.png"
                alt="XP"
                width={16}
                height={16}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-xs text-[#382C22]">
                {user?.xp ?? 252}
              </span>
            </div>
          </div>
        </header>

        {/* ── 3. VIEW TOGGLE (Individu vs Kelas) ── */}
        <div className="w-full max-w-[280px] mx-auto bg-white/85 p-1 rounded-full border-[2px] border-[#7DD3FC] shadow-sm flex items-center justify-between mb-8 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setActiveTab("individu")}
            className={`flex-1 py-1.5 rounded-full font-fredoka font-black text-xs text-center transition-all cursor-pointer ${
              activeTab === "individu"
                ? "bg-[#0284C7] text-white shadow-[0_2px_6px_rgba(2,132,199,0.35)]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            Individu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kelas")}
            className={`flex-1 py-1.5 rounded-full font-fredoka font-black text-xs text-center transition-all cursor-pointer ${
              activeTab === "kelas"
                ? "bg-[#0284C7] text-white shadow-[0_2px_6px_rgba(2,132,199,0.35)]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            Kelas
          </button>
        </div>

        {/* ── 4. 3 TREE STUMP PODIUM ── */}
        <div className="flex items-end justify-center gap-2 mb-4">
          {/* RANK 2: LEFT STUMP */}
          <div className="flex-1 flex flex-col items-center">
            {/* Mascot Rank 2 */}
            <div className="relative w-18 h-18 -mb-3.5 z-20">
              <Image
                src="/screens_assets/mascot_thumbsup_transparent.png"
                alt="Rank 2 Mascot"
                width={72}
                height={72}
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Stump Body */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[96%] h-5 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-2.5 z-10 shadow-inner" />
              <div className="w-full h-28 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl border-x-2 border-b-2 border-[#5c2a08] flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_4px_0_8px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white">
                {/* Silver Medal 2 */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#f8fafc] to-[#94a3b8] border-2 border-white flex items-center justify-center font-fredoka font-black text-xs text-[#334155] shadow-md mb-1">
                  2
                </div>
                <span className="font-fredoka font-black text-xs text-white truncate max-w-[80px] text-center">
                  {top2 ? top2.name : "-"}
                </span>
                <span className="font-fredoka font-bold text-[10px] text-[#FEF08A] flex items-center gap-0.5 mt-0.5">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={10} height={10} />
                  {top2 ? `${top2.xp} XP` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* RANK 1: CENTER TALLEST STUMP */}
          <div className="flex-1 flex flex-col items-center z-30">
            {/* Mascot Rank 1 + Crown */}
            <div className="relative w-22 h-22 -mb-4 z-20 flex items-center justify-center">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow animate-bounce" style={{ animationDuration: "3s" }}>
                👑
              </span>
              <Image
                src="/screens_assets/mascot_cheer.jpg"
                alt="Rank 1 Mascot"
                width={84}
                height={84}
                className="object-contain drop-shadow-lg rounded-full"
              />
            </div>
            {/* Stump Tall Body */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[96%] h-6 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-3 z-10 shadow-inner" />
              <div className="w-full h-36 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl border-x-2 border-b-2 border-[#5c2a08] flex flex-col items-center pt-3.5 pb-2 px-1 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_4px_0_8px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white">
                {/* Gold Medal 1 */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#fef08a] to-[#f59e0b] border-2 border-white flex items-center justify-center font-fredoka font-black text-sm text-[#78350f] shadow-md mb-1 animate-pulse">
                  1
                </div>
                <span className="font-fredoka font-black text-xs text-white truncate max-w-[88px] text-center">
                  {top1 ? top1.name : "Juara 1"}
                </span>
                <span className="font-fredoka font-bold text-[11px] text-[#FEF08A] flex items-center gap-0.5 mt-0.5">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={11} height={11} />
                  {top1 ? `${top1.xp} XP` : "0 XP"}
                </span>
              </div>
            </div>
          </div>

          {/* RANK 3: RIGHT STUMP */}
          <div className="flex-1 flex flex-col items-center">
            {/* Mascot Rank 3 */}
            <div className="relative w-18 h-18 -mb-3.5 z-20">
              <div className="absolute -top-2 right-0 text-xs animate-ping">❤️</div>
              <Image
                src="/screens_assets/mascot_wink.png"
                alt="Rank 3 Mascot"
                width={72}
                height={72}
                className="object-contain drop-shadow-md"
              />
            </div>
            {/* Stump Body */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[96%] h-5 bg-[radial-gradient(ellipse_at_50%_50%,#e8c697_0%,#d4a76f_40%,#b8864e_85%,#8c4e1f_100%)] rounded-full -mb-2.5 z-10 shadow-inner" />
              <div className="w-full h-24 bg-gradient-to-b from-[#a4622f] via-[#87471a] to-[#69320e] rounded-b-2xl border-x-2 border-b-2 border-[#5c2a08] flex flex-col items-center pt-3 pb-2 px-1 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_4px_0_8px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.15)] text-white">
                {/* Bronze Medal 3 */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#fed7aa] to-[#ea580c] border-2 border-white flex items-center justify-center font-fredoka font-black text-xs text-white shadow-md mb-1">
                  3
                </div>
                <span className="font-fredoka font-black text-xs text-white truncate max-w-[80px] text-center">
                  {top3 ? top3.name : "-"}
                </span>
                <span className="font-fredoka font-bold text-[10px] text-[#FEF08A] flex items-center gap-0.5 mt-0.5">
                  <Image src="/assets_game/exp_progress.png" alt="XP" width={10} height={10} />
                  {top3 ? `${top3.xp} XP` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. RANKED LIST CARD (#4 ONWARD) ── */}
        <div className="w-full bg-white border-[2.5px] border-[#382C22] rounded-[24px] p-3 shadow-[0_4px_0_#382C22] flex flex-col gap-2 mt-2">
          {restEntries.length > 0 ? (
            restEntries.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border-[1.5px] transition-all ${
                  item.isCurrentUser
                    ? "bg-[#E0F2FE] border-[#38BDF8] shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Disc Badge */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#F1F5F9] to-[#CBD5E1] border border-[#94A3B8] flex items-center justify-center font-fredoka font-black text-xs text-[#475569] shadow-xs flex-shrink-0">
                    {item.rank}
                  </div>
                  <span
                    className={`font-fredoka font-black text-sm ${
                      item.isCurrentUser ? "text-[#0284C7]" : "text-[#1E293B]"
                    }`}
                  >
                    {item.name} {item.isCurrentUser && "(Kamu)"}
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
              <p className="font-fredoka font-bold text-xs text-[#64748B] max-w-[240px]">
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
