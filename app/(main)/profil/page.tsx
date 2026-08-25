"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserOwnedFrames,
  equipFrameInDatabase,
} from "@/lib/supabase";

interface RankTier {
  name: string;
  minXp: number;
  maxXp: number;
  badgeImg: string;
}

const RANK_TIERS: RankTier[] = [
  { name: "Rookie", minXp: 0, maxXp: 300, badgeImg: "/screens_assets/badge_rookie.png" },
  { name: "Explorer", minXp: 301, maxXp: 700, badgeImg: "/screens_assets/badge_explorer.png" },
  { name: "Guardian", minXp: 701, maxXp: 1200, badgeImg: "/screens_assets/badge_guardian.png" },
  { name: "Warrior", minXp: 1201, maxXp: 1800, badgeImg: "/screens_assets/badge_warrior.png" },
  { name: "Champion", minXp: 1801, maxXp: 3000, badgeImg: "/screens_assets/badge_champion.png" },
];

const BORDER_NAMES: Record<string, string> = {
  eco_green: "Eco Green",
  autumn_forest: "Autumn Forest",
  sakura_pink: "Sakura Pink",
  ocean_guardian: "Ocean Guardian",
  forest_guardian: "Forest Guardian",
  twilight_guardian: "Twilight Guardian",
  crystal_ice: "Crystal Ice",
  crystal_amethyst: "Crystal Amethyst",
  crystal_ruby: "Crystal Ruby",
  emerald_royal: "Emerald Royal",
  sapphire_royal: "Sapphire Royal",
  golden_monarch: "Golden Monarch",
  frame_teal_tech: "Teal Tech",
  frame_blue_crystal: "Blue Crystal",
  frame_green_leafy: "Green Leafy",
  frame_dark_teal_gold: "Teal Gold Deluxe",
};

export default function ProfilPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [ownedFrames, setOwnedFrames] = useState<string[]>(["eco_green", "frame_teal_tech"]);
  const [selectedFrame, setSelectedFrame] = useState<string>("eco_green");
  const [equipNotice, setEquipNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        const owned = await fetchUserOwnedFrames(user.id);
        setOwnedFrames(owned);
        setSelectedFrame(user.selected_frame || "eco_green");
      } else {
        try {
          const savedOwned = localStorage.getItem("thinkbin_owned_frames");
          if (savedOwned) setOwnedFrames(JSON.parse(savedOwned));
          const savedSelected = localStorage.getItem("thinkbin_selected_frame") || "eco_green";
          setSelectedFrame(savedSelected);
        } catch {
          // fallback
        }
      }
    }
    loadProfile();
  }, [user]);

  const userXp = user?.xp ?? 0;
  const currentRank =
    RANK_TIERS.find((r) => userXp >= r.minXp && userXp <= r.maxXp) || RANK_TIERS[0];
  const progressPercent = Math.min(
    Math.round(((userXp - currentRank.minXp) / (currentRank.maxXp - currentRank.minXp)) * 100),
    100
  );

  const handleEquipBorder = async (frameId: string) => {
    if (user?.id) {
      await equipFrameInDatabase(user.id, frameId);
    }
    setSelectedFrame(frameId);
    updateUser({ selected_frame: frameId });
    setEquipNotice(`✨ Border "${BORDER_NAMES[frameId] || frameId}" berhasil dipasang!`);
    setTimeout(() => setEquipNotice(null), 3000);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="relative flex flex-col min-h-full px-4 pt-3 pb-24 select-none bg-[#FFFBEA]">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-fredoka font-black text-2xl text-[#382C22]">
          Profil Saya
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border-[2px] border-red-200 rounded-2xl font-fredoka font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          Keluar
        </button>
      </div>

      {/* CARD 1: PROFILE HERO BANNER CARD WITH LANDSCAPE BACKGROUND */}
      <div className="relative bg-white border-[3px] border-[#382C22] rounded-3xl overflow-hidden shadow-[0_5px_0_#382C22] mb-4">
        {/* Landscape Cover */}
        <div className="relative w-full h-24 overflow-hidden">
          <Image
            src="/screens_assets/hero_bg.jpg"
            alt="Hero Landscape"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="relative flex flex-col items-center px-4 pb-4 -mt-12">
          {/* Avatar Container with Frame */}
          <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#FEF3C7] border-[3px] border-[#382C22] flex items-center justify-center overflow-hidden shadow-md">
              <Image
                src="/screens_assets/mascot_thumbsup_transparent.png"
                alt="Avatar"
                width={70}
                height={70}
                className="object-contain"
              />
            </div>
            {/* Equipped Frame Overlay */}
            {selectedFrame && (
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={
                    selectedFrame.startsWith("frame_")
                      ? `/assets_game/${selectedFrame}.png`
                      : selectedFrame === "mystery_box"
                      ? "/assets_game/mystery_box.png"
                      : `/assets_game/border1.png`
                  }
                  alt="Equipped Frame"
                  fill
                  className="object-contain scale-110"
                />
              </div>
            )}
          </div>

          {/* User Name & Class */}
          <span className="font-fredoka font-black text-lg text-[#382C22] text-center leading-tight">
            {user?.display_name || "Siswa ThinkBin"}
          </span>
          <span className="font-nunito font-bold text-xs text-[#796F65] text-center mb-3">
            Kelas {user?.class_name || "9C"} • Absen #{user?.student_number || "28"}
          </span>

          {/* Level Progress Bar */}
          <div className="w-full max-w-[280px] flex flex-col items-center gap-1">
            <div className="w-full h-3.5 bg-[#E2E8F0] border-[1.5px] border-[#382C22] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#22C55E] to-[#15803D] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 6)}%` }}
              />
            </div>
            <span className="font-fredoka font-bold text-[11px] text-[#382C22]">
              {userXp} / {currentRank.maxXp} XP Menuju Rank Berikutnya
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2: THREE SEPARATE SQUARE STATS CARDS */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Square 1: Streak */}
        <div className="flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-2xl p-2.5 shadow-[0_3px_0_#382C22]">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] flex items-center justify-center mb-1.5">
            <Image
              src="/assets_game/streak_green_card.png"
              alt="Streak"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-sm text-[#382C22]">
            {user?.streak ?? 1} Hari
          </span>
          <span className="font-nunito font-bold text-[10px] text-[#796F65]">
            Streak
          </span>
        </div>

        {/* Square 2: XP */}
        <div className="flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-2xl p-2.5 shadow-[0_3px_0_#382C22]">
          <div className="w-10 h-10 rounded-xl bg-[#FEFCE8] border border-[#FDE047] flex items-center justify-center mb-1.5">
            <Image
              src="/assets_game/exp_progress.png"
              alt="XP"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-sm text-[#382C22]">
            {userXp}
          </span>
          <span className="font-nunito font-bold text-[10px] text-[#796F65]">
            XP
          </span>
        </div>

        {/* Square 3: Koin */}
        <div className="flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-2xl p-2.5 shadow-[0_3px_0_#382C22]">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] flex items-center justify-center mb-1.5">
            <Image
              src="/assets_game/coin.png"
              alt="Koin"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-sm text-[#382C22]">
            {user?.coins ?? 0}
          </span>
          <span className="font-nunito font-bold text-[10px] text-[#796F65]">
            Koin
          </span>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {equipNotice && (
        <div className="p-2.5 mb-3 bg-emerald-100 border-[2px] border-[#15803D] rounded-2xl font-fredoka font-bold text-xs text-[#15803D] text-center shadow-xs animate-in zoom-in duration-200">
          {equipNotice}
        </div>
      )}

      {/* CARD 2.5: BORDER AVATAR COLLECTION & SWITCHER */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-3xl p-3.5 mb-4 shadow-[0_4px_0_#382C22]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex flex-col">
            <span className="font-fredoka font-bold text-[10px] text-[#1CB0F6] uppercase tracking-wider">
              BORDER AVATAR
            </span>
            <span className="font-fredoka font-extrabold text-sm text-[#382C22]">
              Pasang & Koleksi Border
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/toko")}
            className="text-[11px] font-fredoka font-bold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-1 rounded-xl hover:bg-[#BBF7D0] cursor-pointer"
          >
            + Toko
          </button>
        </div>

        {/* Owned Borders Horizontal Grid */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {ownedFrames.map((fId) => {
            const isEquipped = selectedFrame === fId;
            return (
              <button
                key={fId}
                type="button"
                onClick={() => handleEquipBorder(fId)}
                className={`flex-shrink-0 flex flex-col items-center p-2 rounded-2xl border-[2px] cursor-pointer transition-all ${
                  isEquipped
                    ? "bg-[#DCFCE7] border-[#22C55E] shadow-sm scale-105"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                }`}
              >
                <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                  <Image
                    src="/screens_assets/mascot_thumbsup_transparent.png"
                    alt="Border Preview"
                    width={32}
                    height={32}
                    className="rounded-full object-contain"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <Image
                      src={
                        fId.startsWith("frame_")
                          ? `/assets_game/${fId}.png`
                          : `/assets_game/border1.png`
                      }
                      alt={fId}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="font-fredoka font-bold text-[10px] text-[#382C22] truncate max-w-[65px]">
                  {BORDER_NAMES[fId] || fId}
                </span>
                <span
                  className={`text-[8px] font-fredoka font-extrabold mt-0.5 ${
                    isEquipped ? "text-[#15803D]" : "text-[#94A3B8]"
                  }`}
                >
                  {isEquipped ? "Terpasang" : "Pasang"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CARD 3: ACTIVE RANK CARD */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-3xl p-3.5 mb-4 shadow-[0_4px_0_#382C22] flex items-center justify-between">
        <div className="flex flex-col flex-1 pr-2">
          <span className="font-fredoka font-bold text-[10px] text-[#1CB0F6] uppercase tracking-wider">
            RANK SAAT INI
          </span>
          <span className="font-fredoka font-black text-xl text-[#382C22] mb-1.5">
            {currentRank.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-[#FEF08A] text-[#713F12] border border-[#FACC15] px-2 py-0.5 rounded-full font-fredoka font-black text-[9px]">
              XP
            </span>
            <div className="flex-1 h-3 bg-[#E2E8F0] border border-[#382C22] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#F59E0B] rounded-full"
                style={{ width: `${Math.max(progressPercent, 8)}%` }}
              />
            </div>
            <span className="font-fredoka font-bold text-[10px] text-[#796F65]">
              {userXp} / {currentRank.maxXp}
            </span>
          </div>
        </div>

        {/* Large Badge */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={currentRank.badgeImg}
            alt={currentRank.name}
            width={64}
            height={64}
            className="object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* CARD 4: JALUR RANK PATH CARD (5 Badges in order) */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-3xl p-3.5 shadow-[0_4px_0_#382C22]">
        <span className="font-fredoka font-extrabold text-sm text-[#382C22] block mb-3">
          Jalur Rank
        </span>

        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
          {RANK_TIERS.map((tier, idx) => {
            const isReached = userXp >= tier.minXp;
            const isCurrent = currentRank.name === tier.name;

            return (
              <React.Fragment key={tier.name}>
                <div
                  className={`flex flex-col items-center flex-shrink-0 ${
                    isCurrent ? "scale-110" : ""
                  }`}
                >
                  <div
                    className={`relative w-11 h-11 rounded-2xl border-[2px] p-1 flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#FEF08A] border-[#EAB308] shadow-md"
                        : isReached
                        ? "bg-[#DCFCE7] border-[#22C55E]"
                        : "bg-[#F1F5F9] border-[#CBD5E1] opacity-60 grayscale"
                    }`}
                  >
                    <Image
                      src={tier.badgeImg}
                      alt={tier.name}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={`font-fredoka text-[10px] mt-1 ${
                      isCurrent
                        ? "font-black text-[#B45309]"
                        : "font-bold text-[#64748B]"
                    }`}
                  >
                    {tier.name}
                  </span>
                </div>

                {idx < RANK_TIERS.length - 1 && (
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
