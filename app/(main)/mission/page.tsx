"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface MissionItem {
  id: string;
  title: string;
  desc: string;
  xpReward: number;
  coinReward: number;
  progress: number;
  target: number;
  claimed: boolean;
}

export default function MissionPage() {
  const { user, updateUser } = useAuth();
  const [missions, setMissions] = useState<MissionItem[]>([
    {
      id: "m1",
      title: "Membaca Materi Baru",
      desc: "Buka dan pelajari 1 materi di Peta Belajar",
      xpReward: 10,
      coinReward: 15,
      progress: 0,
      target: 1,
      claimed: false,
    },
    {
      id: "m2",
      title: "Penakluk Kuis Harian",
      desc: "Jawab kuis pemahaman dengan benar",
      xpReward: 15,
      coinReward: 20,
      progress: 0,
      target: 1,
      claimed: false,
    },
    {
      id: "m3",
      title: "Pilah Kilat di Minigame",
      desc: "Selesaikan 1 sesi tantangan bertimer",
      xpReward: 20,
      coinReward: 25,
      progress: 0,
      target: 1,
      claimed: false,
    },
    {
      id: "m4",
      title: "Evaluasi Riset ThinkBin",
      desc: "Isi Kuisioner Awal atau Kuisioner Akhir",
      xpReward: 30,
      coinReward: 40,
      progress: 0,
      target: 1,
      claimed: false,
    },
  ]);

  useEffect(() => {
    try {
      const savedClaimed = localStorage.getItem("thinkbin_claimed_missions");
      if (savedClaimed) {
        const claimedIds: string[] = JSON.parse(savedClaimed);
        setMissions((prev) =>
          prev.map((m) => ({ ...m, claimed: claimedIds.includes(m.id) }))
        );
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleClaim = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.claimed || mission.progress < mission.target) return;

    const newXp = (user?.xp ?? 0) + mission.xpReward;
    const newCoins = (user?.coins ?? 0) + mission.coinReward;

    updateUser({ xp: newXp, coins: newCoins });

    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );
    setMissions(updatedMissions);

    const claimedIds = updatedMissions.filter((m) => m.claimed).map((m) => m.id);
    localStorage.setItem("thinkbin_claimed_missions", JSON.stringify(claimedIds));
  };

  return (
    <div className="relative flex flex-col min-h-full px-4 pt-3 pb-16 select-none bg-gradient-to-b from-[#FFFDF9] to-[#F5E6CC]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-fredoka font-extrabold text-xl text-[#382C22]">
          🎖️ Misi Harian & Target
        </h1>
        <Link
          href="/dashboard"
          className="text-xs font-fredoka font-bold text-[#1CB0F6] bg-white border border-[#BAE6FD] px-3 py-1 rounded-full shadow-xs"
        >
          ← Beranda
        </Link>
      </div>

      {/* BANNER STREAK DAILY GOAL */}
      <div className="bg-gradient-to-r from-[#8A62DC] to-[#764DC9] text-white rounded-3xl p-4 mb-4 shadow-md flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="font-fredoka font-bold text-[11px] text-amber-300 uppercase tracking-wider">
            TARGET HARIAN • DAY 1
          </span>
          <h3 className="font-fredoka font-extrabold text-base leading-tight mt-0.5">
            Pertahankan Streak Belajarmu! 🔥
          </h3>
          <p className="font-nunito font-semibold text-xs text-purple-100 mt-1">
            Selesaikan misi untuk mendapatkan bonus koin & border profil!
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
          🎯
        </div>
      </div>

      {/* MISSIONS LIST */}
      <div className="flex flex-col gap-3 pb-6">
        {missions.map((m) => {
          const isReady = m.progress >= m.target && !m.claimed;

          return (
            <div
              key={m.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-[2px] border-b-[4.5px] transition-all shadow-xs ${
                m.claimed
                  ? "bg-gray-50 border-gray-200 opacity-60"
                  : isReady
                  ? "bg-[#F4FBF0] border-[#58CC02]"
                  : "bg-white border-[#E5E5E5]"
              }`}
            >
              <div className="flex flex-col text-left max-w-[200px]">
                <span className="font-fredoka font-bold text-xs text-[#382C22] leading-snug">
                  {m.title}
                </span>
                <p className="font-nunito text-[10.5px] text-[#796F65] leading-tight mt-0.5">
                  {m.desc}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 font-fredoka font-bold text-[10px] text-[#1CB0F6]">
                    <Image
                      src="/assets_game/exp_progress.png"
                      alt="XP Daun Petir"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                    <span>+{m.xpReward} XP</span>
                  </div>
                  <span className="text-[#796F65]">•</span>
                  <div className="flex items-center gap-1 font-fredoka font-bold text-[10px] text-[#F57F17]">
                    <Image
                      src="/assets_game/coin.png"
                      alt="Koin Daun Kuning"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                    <span>+{m.coinReward} Koin</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleClaim(m.id)}
                disabled={!isReady}
                className={`py-2 px-4 rounded-xl font-fredoka font-extrabold text-xs transition-all shadow-xs ${
                  m.claimed
                    ? "bg-gray-200 text-gray-400 cursor-default"
                    : isReady
                    ? "bg-[#58CC02] hover:bg-[#4CAF00] text-white active:translate-y-0.5 cursor-pointer"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                {m.claimed ? "Sudah Diklaim ✓" : isReady ? "Klaim Hadiah 🎁" : `${m.progress}/${m.target}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
