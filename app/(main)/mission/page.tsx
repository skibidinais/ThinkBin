"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchUserCompletedNodes, claimDailyMissionTransaction } from "@/lib/supabase";

interface MissionState {
  m1Claimed: boolean; // Login
  m2Claimed: boolean; // 1 Node Belajar
  m3Visited: boolean; // Leaderboard
  m3Claimed: boolean;
  m4Visited: boolean; // Toko
  m4Claimed: boolean;
  m5Visited: boolean; // Profil
  m5Claimed: boolean;
}

export default function MissionPage() {
  const { user, updateUser, refreshProfile } = useAuth();
  const router = useRouter();

  // State for 5 missions
  const [missionState, setMissionState] = useState<MissionState>({
    m1Claimed: false,
    m2Claimed: false,
    m3Visited: false,
    m3Claimed: false,
    m4Visited: false,
    m4Claimed: false,
    m5Visited: false,
    m5Claimed: false,
  });

  const [completedNodeCount, setCompletedNodeCount] = useState<number>(0);
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStorageKey = () => {
    const userSuffix = user?.id ? `_${user.id}` : "_guest";
    return `thinkbin_missions_${getTodayKey()}${userSuffix}`;
  };

  // Load completed nodes & fresh profile from Supabase / localStorage
  useEffect(() => {
    async function checkNodes() {
      if (user?.id) {
        refreshProfile(user.id).catch(() => {});
        try {
          const completedNodes = await fetchUserCompletedNodes(user.id);
          setCompletedNodeCount(completedNodes.length);
        } catch {
          // Check local fallback
          try {
            const raw = localStorage.getItem(`tb_completed_nodes_${user.id}`);
            if (raw) {
              const parsed: number[] = JSON.parse(raw);
              setCompletedNodeCount(parsed.length);
            }
          } catch {
            setCompletedNodeCount(0);
          }
        }
      }
    }
    checkNodes();
  }, [user?.id]);

  // Load saved state from localStorage with today's date validation (Auto-Reset per day)
  useEffect(() => {
    try {
      // Clean up legacy non-dated cache if present
      localStorage.removeItem("thinkbin_missions_progress_v3");
      localStorage.removeItem("thinkbin_missions_progress_v2");
      localStorage.removeItem("thinkbin_missions_progress");

      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        setMissionState(JSON.parse(saved));
      } else {
        // New day or first open today -> Reset missions to fresh state
        const freshState: MissionState = {
          m1Claimed: false,
          m2Claimed: false,
          m3Visited: false,
          m3Claimed: false,
          m4Visited: false,
          m4Claimed: false,
          m5Visited: false,
          m5Claimed: false,
        };
        setMissionState(freshState);
        localStorage.setItem(key, JSON.stringify(freshState));
      }
    } catch {
      // Fallback
    }
  }, [user?.id]);

  // Update countdown every second
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown("00:00:00");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, "0");
      setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveState = (newState: MissionState) => {
    setMissionState(newState);
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(newState));
    } catch {
      // ignore
    }
  };

  // Completed count
  const completedCount = [
    missionState.m1Claimed,
    missionState.m2Claimed,
    missionState.m3Claimed,
    missionState.m4Claimed,
    missionState.m5Claimed,
  ].filter(Boolean).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClaim = async (
    missionKey: keyof MissionState,
    coinReward: number,
    xpReward: number,
    title: string
  ) => {
    if (missionState[missionKey]) return; // Prevent double claim

    // 1. Mark as claimed and save state
    const updated = { ...missionState, [missionKey]: true };
    saveState(updated);

    // 2. Compute new totals
    const currentCoins = user?.coins ?? 0;
    const currentXp = user?.xp ?? 0;
    const newCoins = currentCoins + coinReward;
    const newXp = currentXp + xpReward;

    // 3. Update Auth Context state & LocalStorage immediately
    updateUser({ coins: newCoins, xp: newXp });
    showToast(`Berhasil klaim +${coinReward} Coin & +${xpReward} XP dari "${title}"!`);

    // 4. Authoritative Supabase update
    if (user?.id) {
      try {
        const res = await claimDailyMissionTransaction({
          userId: user.id,
          missionId: missionKey,
          coinReward,
          xpReward,
        });

        if (res.success && res.currentCoins !== undefined) {
          updateUser({
            coins: res.currentCoins,
            xp: res.currentXp ?? newXp,
          });
        }
      } catch (err) {
        console.warn("Mission claim RPC fallback:", err);
      }
    }
  };

  const handleNavigate = (path: string, visitKey?: "m3Visited" | "m4Visited" | "m5Visited") => {
    if (visitKey) {
      const updated = { ...missionState, [visitKey]: true };
      saveState(updated);
    }
    router.push(path);
  };

  const isM2ReadyToClaim = completedNodeCount >= 1 && !missionState.m2Claimed;

  return (
    <div className="relative flex flex-col w-full min-h-full px-4 pt-3 pb-32 select-none bg-[#FDE8A5]">
      {/* TOAST POPUP NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1E293B] text-white border-2 border-[#F59E0B] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="font-fredoka font-bold text-xs tracking-wide">{toastMsg}</span>
        </div>
      )}

      {/* ── 1. HEADER (Title on left, Coin Counter Pill on right) ── */}
      <header className="flex items-center justify-between pt-1 pb-3 flex-shrink-0">
        <h1 className="font-fredoka font-extrabold text-[26px] text-[#382C22] tracking-tight">
          Misi Harian
        </h1>

        <div className="flex items-center gap-2">
          {/* Coin Pill */}
          <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] rounded-full px-3 py-1 shadow-[0_2.5px_0_#382C22]">
            <Image
              src="/screens_assets/coin.png"
              alt="Coin"
              width={18}
              height={18}
              className="object-contain"
            />
            <span className="font-fredoka font-black text-sm text-[#382C22]">
              {user?.coins ?? 0}
            </span>
          </div>
        </div>
      </header>

      {/* ── 2. TOTAL HADIAH HARIAN & RESET BANNER (5 Misi: 55 Koin / hari) ── */}
      <div className="bg-gradient-to-br from-[#FFF9E6] to-white border-[2.5px] border-[#382C22] rounded-[22px] p-3.5 flex items-center justify-between shadow-[0_3px_0_rgba(0,0,0,0.05)] mb-3 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="font-fredoka font-black text-[11px] uppercase text-[#796F65] tracking-wider">
            TOTAL HADIAH HARIAN (5 MISI)
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={18}
                height={18}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-[17px] text-[#B45309]">
                55 Coin
              </span>
            </div>
            <span className="font-fredoka font-bold text-xs text-[#796F65]">
              / hari
            </span>
          </div>
        </div>

        {/* Reset Badge */}
        <div className="bg-[#FFF0E6] border-[1.5px] border-[#EA580C] rounded-2xl px-3 py-1.5 flex flex-col items-end">
          <span className="font-fredoka font-black text-[9.5px] text-[#EA580C]">
            Reset jam 00.00
          </span>
          <span className="font-fredoka font-black text-[14px] text-[#9A3412] tabular-nums leading-tight">
            {countdown}
          </span>
        </div>
      </div>

      {/* ── 3. SUBHEADING: DAFTAR MISI HARI INI + BADGE ── */}
      <div className="flex items-center justify-between px-1 mb-2.5 flex-shrink-0">
        <span className="font-fredoka font-black text-[11.5px] text-[#6B5B4F] tracking-wider uppercase">
          DAFTAR MISI HARI INI
        </span>
        <span className="bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-fredoka font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
          {completedCount}/5 Selesai
        </span>
      </div>

      {/* ── 4. STACK OF 5 MISSION CARDS (Each awards Coin + 3 XP) ── */}
      <div className="flex flex-col gap-2.5 mb-3.5 flex-shrink-0">
        
        {/* MISSION 1: Login hari ini (buka app) */}
        <div
          className={`border-[2.5px] rounded-[20px] p-3 flex items-center gap-3 shadow-[0_3px_0_#382C22] transition-all ${
            missionState.m1Claimed
              ? "bg-[#F0FDF4] border-[#86EFAC]"
              : "bg-white border-[#382C22]"
          }`}
        >
          <div className="w-11 h-11 min-w-[44px] bg-[#10B981] border-2 border-[#382C22] rounded-xl flex items-center justify-center shadow-[0_2px_0_#382C22] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              className={`font-fredoka font-black text-[13.5px] leading-snug truncate ${
                missionState.m1Claimed ? "line-through text-[#15803D]" : "text-[#382C22]"
              }`}
            >
              Login hari ini (buka app)
            </span>
            <div className="flex items-center gap-1">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-[11.5px] text-[#D97706]">
                +10 Coin
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2.5 bg-[#E2D3B8] border border-[#382C22] rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-[#22C55E] rounded-full w-full" />
            </div>
          </div>

          {/* Action Button */}
          {missionState.m1Claimed ? (
            <button
              type="button"
              disabled
              className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-fredoka font-black text-xs px-3 py-1.5 rounded-xl cursor-default flex-shrink-0"
            >
              Selesai
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleClaim("m1Claimed", 10, 5, "Login hari ini")}
              className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0 animate-pulse"
            >
              Klaim!
            </button>
          )}
        </div>

        {/* MISSION 2: Selesaikan minimal 1 node belajar */}
        <div
          className={`border-[2.5px] rounded-[20px] p-3 flex items-center gap-3 shadow-[0_3px_0_#382C22] transition-all ${
            missionState.m2Claimed
              ? "bg-[#F0FDF4] border-[#86EFAC]"
              : "bg-white border-[#382C22]"
          }`}
        >
          <div className="w-11 h-11 min-w-[44px] bg-[#3B82F6] border-2 border-[#382C22] rounded-xl flex items-center justify-center shadow-[0_2px_0_#382C22] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              className={`font-fredoka font-black text-[13.5px] leading-snug truncate ${
                missionState.m2Claimed ? "line-through text-[#15803D]" : "text-[#382C22]"
              }`}
            >
              Selesaikan minimal 1 node belajar
            </span>
            <div className="flex items-center gap-1">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-[11.5px] text-[#D97706]">
                +15 Coin
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2.5 bg-[#E2D3B8] border border-[#382C22] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all"
                style={{ width: completedNodeCount >= 1 ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Action Button */}
          {missionState.m2Claimed ? (
            <button
              type="button"
              disabled
              className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-fredoka font-black text-xs px-3 py-1.5 rounded-xl cursor-default flex-shrink-0"
            >
              Selesai
            </button>
          ) : isM2ReadyToClaim ? (
            <button
              type="button"
              onClick={() => handleClaim("m2Claimed", 15, 10, "Selesaikan 1 node belajar")}
              className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0 animate-pulse"
            >
              Klaim!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate("/belajar")}
              className="bg-[#F5B82E] hover:bg-[#EAB308] text-[#382C22] font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              Mulai
            </button>
          )}
        </div>

        {/* MISSION 3: Kunjungi Papan Peringkat */}
        <div
          className={`border-[2.5px] rounded-[20px] p-3 flex items-center gap-3 shadow-[0_3px_0_#382C22] transition-all ${
            missionState.m3Claimed
              ? "bg-[#F0FDF4] border-[#86EFAC]"
              : "bg-white border-[#382C22]"
          }`}
        >
          <div className="w-11 h-11 min-w-[44px] bg-[#F59E0B] border-2 border-[#382C22] rounded-xl flex items-center justify-center shadow-[0_2px_0_#382C22] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              className={`font-fredoka font-black text-[13.5px] leading-snug truncate ${
                missionState.m3Claimed ? "line-through text-[#15803D]" : "text-[#382C22]"
              }`}
            >
              Kunjungi Papan Peringkat
            </span>
            <div className="flex items-center gap-1">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-[11.5px] text-[#D97706]">
                +10 Coin
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2.5 bg-[#E2D3B8] border border-[#382C22] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all"
                style={{ width: missionState.m3Claimed || missionState.m3Visited ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Action Button */}
          {missionState.m3Claimed ? (
            <button
              type="button"
              disabled
              className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-fredoka font-black text-xs px-3 py-1.5 rounded-xl cursor-default flex-shrink-0"
            >
              Selesai
            </button>
          ) : missionState.m3Visited ? (
            <button
              type="button"
              onClick={() => handleClaim("m3Claimed", 10, 5, "Kunjungi Papan Peringkat")}
              className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0 animate-pulse"
            >
              Klaim!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate("/leaderboard", "m3Visited")}
              className="bg-[#F5B82E] hover:bg-[#EAB308] text-[#382C22] font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              Buka
            </button>
          )}
        </div>

        {/* MISSION 4: Kunjungi Toko */}
        <div
          className={`border-[2.5px] rounded-[20px] p-3 flex items-center gap-3 shadow-[0_3px_0_#382C22] transition-all ${
            missionState.m4Claimed
              ? "bg-[#F0FDF4] border-[#86EFAC]"
              : "bg-white border-[#382C22]"
          }`}
        >
          <div className="w-11 h-11 min-w-[44px] bg-[#EC4899] border-2 border-[#382C22] rounded-xl flex items-center justify-center shadow-[0_2px_0_#382C22] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              className={`font-fredoka font-black text-[13.5px] leading-snug truncate ${
                missionState.m4Claimed ? "line-through text-[#15803D]" : "text-[#382C22]"
              }`}
            >
              Kunjungi Toko
            </span>
            <div className="flex items-center gap-1">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-[11.5px] text-[#D97706]">
                +10 Coin
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2.5 bg-[#E2D3B8] border border-[#382C22] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all"
                style={{ width: missionState.m4Claimed || missionState.m4Visited ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Action Button */}
          {missionState.m4Claimed ? (
            <button
              type="button"
              disabled
              className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-fredoka font-black text-xs px-3 py-1.5 rounded-xl cursor-default flex-shrink-0"
            >
              Selesai
            </button>
          ) : missionState.m4Visited ? (
            <button
              type="button"
              onClick={() => handleClaim("m4Claimed", 10, 5, "Kunjungi Toko")}
              className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0 animate-pulse"
            >
              Klaim!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate("/toko", "m4Visited")}
              className="bg-[#F5B82E] hover:bg-[#EAB308] text-[#382C22] font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              Buka
            </button>
          )}
        </div>

        {/* MISSION 5: Cek Profil & Rank Kamu */}
        <div
          className={`border-[2.5px] rounded-[20px] p-3 flex items-center gap-3 shadow-[0_3px_0_#382C22] transition-all ${
            missionState.m5Claimed
              ? "bg-[#F0FDF4] border-[#86EFAC]"
              : "bg-white border-[#382C22]"
          }`}
        >
          <div className="w-11 h-11 min-w-[44px] bg-[#8B5CF6] border-2 border-[#382C22] rounded-xl flex items-center justify-center shadow-[0_2px_0_#382C22] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              className={`font-fredoka font-black text-[13.5px] leading-snug truncate ${
                missionState.m5Claimed ? "line-through text-[#15803D]" : "text-[#382C22]"
              }`}
            >
              Cek Profil & Rank Kamu
            </span>
            <div className="flex items-center gap-1">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="font-fredoka font-black text-[11.5px] text-[#D97706]">
                +10 Coin
              </span>
            </div>
            {/* Progress track */}
            <div className="w-full h-2.5 bg-[#E2D3B8] border border-[#382C22] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all"
                style={{ width: missionState.m5Claimed || missionState.m5Visited ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Action Button */}
          {missionState.m5Claimed ? (
            <button
              type="button"
              disabled
              className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-fredoka font-black text-xs px-3 py-1.5 rounded-xl cursor-default flex-shrink-0"
            >
              Selesai
            </button>
          ) : missionState.m5Visited ? (
            <button
              type="button"
              onClick={() => handleClaim("m5Claimed", 10, 5, "Cek Profil & Rank Kamu")}
              className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0 animate-pulse"
            >
              Klaim!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate("/profil", "m5Visited")}
              className="bg-[#F5B82E] hover:bg-[#EAB308] text-[#382C22] font-fredoka font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-[#382C22] shadow-[0_2.5px_0_#382C22] active:translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              Buka
            </button>
          )}
        </div>

      </div>

      {/* ── 5. KUIS TANTANGAN (4 CHECKPOINT) SPECIAL CARD ── */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-[24px] p-4 flex flex-col gap-3 shadow-[0_3px_0_#382C22] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 min-w-[40px] bg-[#FEF3C7] border-2 border-[#382C22] rounded-xl flex items-center justify-center shadow-[0_2px_0_#382C22] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h2 className="font-fredoka font-black text-[15px] text-[#382C22] leading-tight">
              Kuis Tantangan (4 Checkpoint)
            </h2>
            <p className="font-fredoka font-semibold text-[11.5px] text-[#796F65] leading-tight mt-0.5">
              Uji pengetahuan dan kumpulkan koin ekstra!
            </p>
          </div>
        </div>

        {/* Reward Table */}
        <div className="bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-2xl p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-fredoka font-bold text-xs text-[#4B5563]">
              Selesai (min. 1 jawaban benar)
            </span>
            <div className="flex items-center gap-1 font-fredoka font-black text-xs text-[#D97706]">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span>+20 Coin</span>
            </div>
          </div>

          <div className="border-t border-dashed border-[#E5E7EB]" />

          <div className="flex items-center justify-between">
            <span className="font-fredoka font-extrabold text-xs text-[#92400E]">
              Full combo (semua benar)
            </span>
            <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg px-2 py-0.5 flex items-center gap-1 font-fredoka font-black text-xs text-[#B45309]">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={14}
                height={14}
                className="object-contain"
              />
              <span>35 Coin (total)</span>
            </div>
          </div>
        </div>

        {/* Play Quiz Button */}
        <button
          type="button"
          onClick={() => handleNavigate("/belajar")}
          className="w-full bg-[#3F82E2] hover:bg-[#2563EB] text-white font-fredoka font-black text-sm py-2.5 rounded-2xl border-2 border-[#382C22] shadow-[0_3px_0_#382C22] active:translate-y-0.5 transition-all text-center cursor-pointer"
        >
          Mainkan Kuis Sekarang
        </button>
      </div>

      {/* ── 6. BOTTOM SAFE AREA SPACER ── */}
      <div className="w-full h-24 flex-shrink-0" />
    </div>
  );
}
