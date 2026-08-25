"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

interface StatusBarProps {
  streak?: number;
  xp?: number;
  coins?: number;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  streak: propStreak,
  xp: propXp,
  coins: propCoins,
  className = "",
}) => {
  const { user } = useAuth();

  const streak = propStreak !== undefined ? propStreak : (user?.streak ?? 1);
  const xp = propXp !== undefined ? propXp : (user?.xp ?? 0);
  const coins = propCoins !== undefined ? propCoins : (user?.coins ?? 0);

  return (
    <header
      className={`w-full px-4 pt-3 pb-2 flex items-center justify-between z-40 select-none ${className}`}
    >
      {/* Left: Streak Counter Pill */}
      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border-[2.5px] border-[#e5e5e5] border-b-[4px] px-2.5 py-1 rounded-full shadow-sm">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Image
            src="/assets_game/streak_green_card.png"
            alt="Streak"
            width={20}
            height={20}
            className="object-contain"
            priority
          />
        </div>
        <span className="font-fredoka font-bold text-xs text-[#15803D]">
          {streak} Hari
        </span>
      </div>

      {/* Right: XP & Koin Balances (Real-time Auth Sync) */}
      <div className="flex items-center gap-2">
        {/* XP Pill - Daun Petir */}
        <div
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border-[2.5px] border-[#e5e5e5] border-b-[4px] px-2.5 py-1 rounded-full shadow-sm"
          title="Total XP Daun Petir"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Image
              src="/assets_game/exp_progress.png"
              alt="XP Daun Petir"
              width={20}
              height={20}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-fredoka font-bold text-xs text-[#1cb0f6]">
            {xp} XP
          </span>
        </div>

        {/* Koin Daun Kuning Pill */}
        <div
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border-[2.5px] border-[#e5e5e5] border-b-[4px] px-2.5 py-1 rounded-full shadow-sm"
          title="Koin Daun Kuning"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Image
              src="/assets_game/coin.png"
              alt="Koin Daun Kuning"
              width={20}
              height={20}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-fredoka font-bold text-xs text-[#f57f17]">
            {coins}
          </span>
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
