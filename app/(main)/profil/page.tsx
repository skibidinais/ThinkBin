"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getRankTier } from "@/lib/modul-data";

interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export default function ProfilPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedFrame, setSelectedFrame] = useState<string>("frame_teal_tech");
  const [completedNodesCount, setCompletedNodesCount] = useState<number>(0);

  const currentXp = user?.xp ?? 0;
  const currentCoins = user?.coins ?? 0;
  const currentStreak = user?.streak ?? 1;

  const rankTier = getRankTier(currentXp);

  useEffect(() => {
    try {
      const savedFrame = localStorage.getItem("thinkbin_selected_frame") || user?.selected_frame || "frame_teal_tech";
      setSelectedFrame(savedFrame);
      const savedCompleted = localStorage.getItem("thinkbin_completed_nodes");
      if (savedCompleted) {
        setCompletedNodesCount(JSON.parse(savedCompleted).length);
      }
    } catch {
      // Fallback
    }
  }, [user]);

  const BADGES: BadgeItem[] = [
    {
      id: "b1",
      name: "Pilah Pemula",
      desc: "Menyelesaikan node pembelajaran pertama",
      icon: "🌱",
      unlocked: completedNodesCount >= 1,
    },
    {
      id: "b2",
      name: "Penakluk Kuis",
      desc: "Menjawab 5 kuis dengan tepat",
      icon: "📝",
      unlocked: completedNodesCount >= 5,
    },
    {
      id: "b3",
      name: "Sahabat 3R",
      desc: "Menguasai materi Reduce, Reuse, Recycle",
      icon: "♻️",
      unlocked: completedNodesCount >= 9,
    },
    {
      id: "b4",
      name: "Pahlawan Adiwiyata",
      desc: "Menuntaskan seluruh 16 Node ThinkBin!",
      icon: "👑",
      unlocked: completedNodesCount >= 16,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const frameSource = `/assets_game/${selectedFrame}.png`;

  return (
    <div className="relative flex flex-col min-h-full px-4 pt-3 pb-16 select-none bg-gradient-to-b from-[#FFFDF9] to-[#F5E6CC]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-fredoka font-extrabold text-xl text-[#382C22]">
          👤 Profil Siswa
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-xl font-fredoka font-bold text-xs active:scale-95 transition-all cursor-pointer"
        >
          Keluar
        </button>
      </div>

      {/* CARD 1: HERO PROFILE BANNER */}
      <div className="w-full bg-white border-[3px] border-[#E5E5E5] border-b-[6px] rounded-3xl p-5 shadow-md flex flex-col items-center text-center relative mb-4">
        {/* Avatar with Equipped Border Frame */}
        <div className="relative w-28 h-28 mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
            <Image
              src="/assets/mascot_leonardo.png"
              alt="Avatar"
              width={76}
              height={76}
              className="object-contain"
            />
          </div>
          {/* Equipped Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={frameSource}
              alt="Equipped Frame"
              fill
              className="object-contain drop-shadow-sm"
              onError={(e) => {
                // If frame fails to load, silently hide
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* User Info */}
        <h2 className="font-fredoka font-extrabold text-lg text-[#382C22]">
          {user?.display_name || "Siswa ThinkBin"}
        </h2>
        <div className="flex items-center gap-2 mt-0.5 mb-3">
          <span className="font-nunito font-bold text-xs text-[#796F65]">
            Kelas {user?.class_name || "9C"} • Absen #{user?.student_number || 1}
          </span>
          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${rankTier.color}`}>
            {rankTier.name}
          </span>
        </div>

        {/* Level XP Progress Bar */}
        <div className="w-full max-w-[260px] flex flex-col gap-1">
          <div className="w-full bg-gray-100 border border-[#E5E5E5] h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((currentXp / 320) * 100))}%`,
              }}
            />
          </div>
          <span className="font-fredoka font-bold text-[10px] text-[#796F65]">
            {currentXp} / 320 XP Menuju Legend
          </span>
        </div>
      </div>

      {/* CARD 2: THREE STATS SQUARES */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Streak */}
        <div className="bg-white border-[2.5px] border-[#E5E5E5] border-b-[5px] rounded-2xl p-3 flex flex-col items-center text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-1">
            <Image
              src="/assets_game/streak_green_card.png"
              alt="Streak Daun Hijau"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-extrabold text-sm text-[#15803D]">
            {currentStreak} Hari
          </span>
          <span className="font-nunito font-bold text-[10px] text-[#796F65]">
            Streak Belajar
          </span>
        </div>

        {/* XP - Daun Petir */}
        <div className="bg-white border-[2.5px] border-[#E5E5E5] border-b-[5px] rounded-2xl p-3 flex flex-col items-center text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center mb-1">
            <Image
              src="/assets_game/exp_progress.png"
              alt="XP Daun Petir"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-extrabold text-sm text-[#1CB0F6]">
            {currentXp}
          </span>
          <span className="font-nunito font-bold text-[10px] text-[#796F65]">
            XP Daun Petir
          </span>
        </div>

        {/* Koin - Koin Daun Kuning */}
        <div className="bg-white border-[2.5px] border-[#E5E5E5] border-b-[5px] rounded-2xl p-3 flex flex-col items-center text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center mb-1">
            <Image
              src="/assets_game/coin.png"
              alt="Koin Daun Kuning"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-extrabold text-sm text-[#F57F17]">
            {currentCoins}
          </span>
          <span className="font-nunito font-bold text-[10px] text-[#796F65]">
            Koin Daun
          </span>
        </div>
      </div>

      {/* CARD 3: BADGES & ACHIEVEMENTS GRID */}
      <div className="bg-white border-[2.5px] border-[#E5E5E5] border-b-[5px] rounded-3xl p-4 shadow-sm mb-4">
        <h3 className="font-fredoka font-extrabold text-sm text-[#382C22] mb-3">
          🎖️ Lencana Pencapaian ({completedNodesCount}/16 Node)
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-2xl border-[1.5px] transition-all ${
                b.unlocked
                  ? "bg-[#FFF9E6] border-[#F5B82E] shadow-xs"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
                {b.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-fredoka font-bold text-xs text-[#382C22] leading-tight">
                  {b.name}
                </span>
                <span className="font-nunito text-[9.5px] text-[#796F65] leading-tight line-clamp-1">
                  {b.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
