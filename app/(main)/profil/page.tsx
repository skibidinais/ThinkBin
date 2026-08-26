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
  { name: "Rookie", minXp: 0, maxXp: 39, badgeImg: "/screens_assets/badge_rookie.png" },
  { name: "Explorer", minXp: 40, maxXp: 79, badgeImg: "/screens_assets/badge_explorer.png" },
  { name: "Guardian", minXp: 80, maxXp: 119, badgeImg: "/screens_assets/badge_guardian.png" },
  { name: "Warrior", minXp: 120, maxXp: 179, badgeImg: "/screens_assets/badge_warrior.png" },
  { name: "Champion", minXp: 180, maxXp: 239, badgeImg: "/screens_assets/badge_champion.png" },
];

interface BorderConfigItem {
  id: string;
  name: string;
  imageSrc: string;
  filter?: string;
}

const BORDERS_CATALOG: Record<string, BorderConfigItem> = {
  eco_green: {
    id: "eco_green",
    name: "Eco Green",
    imageSrc: "/screens_assets/border1.png",
  },
  autumn_forest: {
    id: "autumn_forest",
    name: "Autumn Forest",
    imageSrc: "/screens_assets/border1.png",
    filter: "hue-rotate(30deg) saturate(1.2) brightness(0.95)",
  },
  sakura_pink: {
    id: "sakura_pink",
    name: "Sakura Pink",
    imageSrc: "/screens_assets/border1.png",
    filter: "hue-rotate(240deg) saturate(1.4)",
  },
  ocean_guardian: {
    id: "ocean_guardian",
    name: "Ocean Guardian",
    imageSrc: "/screens_assets/border2.png",
    filter: "hue-rotate(180deg) saturate(1.1)",
  },
  forest_guardian: {
    id: "forest_guardian",
    name: "Forest Guardian",
    imageSrc: "/screens_assets/border2.png",
  },
  twilight_guardian: {
    id: "twilight_guardian",
    name: "Twilight Guardian",
    imageSrc: "/screens_assets/border2.png",
    filter: "hue-rotate(90deg) saturate(1.2)",
  },
  crystal_ice: {
    id: "crystal_ice",
    name: "Crystal Ice",
    imageSrc: "/screens_assets/border3.png",
  },
  crystal_amethyst: {
    id: "crystal_amethyst",
    name: "Crystal Amethyst",
    imageSrc: "/screens_assets/border3.png",
    filter: "hue-rotate(70deg) saturate(1.2)",
  },
  crystal_ruby: {
    id: "crystal_ruby",
    name: "Crystal Ruby",
    imageSrc: "/screens_assets/border3.png",
    filter: "hue-rotate(220deg) saturate(1.3)",
  },
  emerald_royal: {
    id: "emerald_royal",
    name: "Emerald Royal",
    imageSrc: "/screens_assets/border4.png",
  },
  sapphire_royal: {
    id: "sapphire_royal",
    name: "Sapphire Royal",
    imageSrc: "/screens_assets/border4.png",
    filter: "hue-rotate(140deg) saturate(1.2)",
  },
  golden_monarch: {
    id: "golden_monarch",
    name: "Golden Monarch",
    imageSrc: "/screens_assets/border4.png",
    filter: "hue-rotate(320deg) brightness(1.1) saturate(1.4)",
  },
};

export default function ProfilPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [ownedFrames, setOwnedFrames] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string>("");
  const [equipNotice, setEquipNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        const owned = await fetchUserOwnedFrames(user.id);
        setOwnedFrames(owned);
        setSelectedFrame(user.selected_frame || "");
      } else {
        try {
          const savedOwned = localStorage.getItem("thinkbin_owned_frames");
          if (savedOwned) {
            setOwnedFrames(JSON.parse(savedOwned));
          }
          const savedSelected = localStorage.getItem("thinkbin_selected_frame") || "";
          setSelectedFrame(savedSelected);
        } catch {
          // Fallback
        }
      }
    }
    loadProfile();
  }, [user]);

  const userXp = user?.xp ?? 0;
  const currentRank =
    RANK_TIERS.find((r) => userXp >= r.minXp && userXp <= r.maxXp) ||
    (userXp > 239 ? RANK_TIERS[4] : RANK_TIERS[0]);

  const progressPercent = Math.min(
    Math.round(((userXp - currentRank.minXp) / (currentRank.maxXp - currentRank.minXp || 1)) * 100),
    100
  );

  const handleEquipBorder = async (frameId: string) => {
    if (user?.id) {
      await equipFrameInDatabase(user.id, frameId);
    }
    setSelectedFrame(frameId);
    updateUser({ selected_frame: frameId });
    const borderName = frameId ? BORDERS_CATALOG[frameId]?.name || frameId : "Polos";
    setEquipNotice(`Border "${borderName}" berhasil dipasang!`);
    setTimeout(() => setEquipNotice(null), 2500);
  };

  const equippedConfig = selectedFrame ? BORDERS_CATALOG[selectedFrame] : null;

  return (
    <div className="relative flex flex-col min-h-full px-4 pt-3 pb-28 select-none bg-[#FFFBEA]">
      
      {/* ── 1. HEADER (Circular Back Button & Title, NO Logout Button) ── */}
      <header className="flex items-center gap-3 mb-3.5 pt-1">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-11 h-11 rounded-full bg-white border-[2.8px] border-[#382C22] shadow-[0_3px_0_#382C22] active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer transition-transform"
          aria-label="Kembali ke Beranda"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 mr-0.5">
            <path
              d="M15 19l-7-7 7-7"
              fill="none"
              stroke="#382C22"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1 className="font-fredoka font-black text-[22px] text-[#382C22]">
          Profil Saya
        </h1>
      </header>

      {/* ── 2. PROFILE HERO BANNER CARD (Cover Landscape, Centered Avatar, Name, XP Bar) ── */}
      <div className="relative bg-white border-[3px] border-[#382C22] rounded-[28px] overflow-hidden shadow-[0_5px_0_#382C22] mb-3.5">
        {/* Landscape Cover */}
        <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-[#e0f2fe]">
          <Image
            src="/screens_assets/hero_bg.jpg"
            alt="Hero Landscape"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="relative flex flex-col items-center px-4 pb-4 -mt-14">
          
          {/* Avatar Container with Frame Overlay & Camera Edit Button */}
          <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
            <div className="w-[84px] h-[84px] rounded-[24px] bg-white border-[3px] border-[#382C22] flex items-center justify-center overflow-hidden shadow-md">
              <Image
                src="/screens_assets/mascot_thumbsup_transparent.png"
                alt="Avatar Mascot"
                width={70}
                height={70}
                className="object-contain"
              />
            </div>

            {/* Equipped Frame Overlay */}
            {equippedConfig && (
              <div
                className="absolute inset-0 pointer-events-none scale-110 flex items-center justify-center"
                style={{ filter: equippedConfig.filter || "none" }}
              >
                <Image
                  src={equippedConfig.imageSrc}
                  alt={equippedConfig.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Camera / Edit Icon Button */}
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#22c55e] border-[2px] border-[#382C22] rounded-lg shadow-xs flex items-center justify-center"
              title="Foto Profil"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>

          {/* User Display Name */}
          <h2 className="font-fredoka font-black text-[20px] text-[#0b1a2d] text-center leading-tight mb-2.5">
            {user?.display_name || "Siswa ThinkBin"}
          </h2>

          {/* XP Progress Bar */}
          <div className="w-full max-w-[290px] flex flex-col items-center gap-1">
            <div className="w-full h-3.5 bg-[#f1f5f9] border-[2px] border-[#382C22] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#fad85e] to-[#e7a627] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 8)}%` }}
              />
            </div>
            <span className="font-fredoka font-extrabold text-[11px] text-[#382C22]">
              {userXp} / {currentRank.maxXp} XP
            </span>
          </div>

        </div>
      </div>

      {/* ── 3. THREE SEPARATE STATS CARDS (Streak, XP, Koin) ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        
        {/* Card 1: Streak */}
        <div className="flex flex-col items-center bg-white border-[3px] border-[#382C22] rounded-[22px] p-2.5 shadow-[0_4px_0_#382C22]">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border-[1.5px] border-[#FDBA74] flex items-center justify-center mb-1.5 overflow-hidden">
            <Image
              src="/screens_assets/streak_icon.png"
              alt="Streak Icon"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-[15px] text-[#382C22] leading-tight">
            {user?.streak ?? 1} Hari
          </span>
          <span className="font-nunito font-bold text-[11px] text-[#796F65]">
            Streak
          </span>
        </div>

        {/* Card 2: XP */}
        <div className="flex flex-col items-center bg-white border-[3px] border-[#382C22] rounded-[22px] p-2.5 shadow-[0_4px_0_#382C22]">
          <div className="w-11 h-11 rounded-2xl bg-[#FEFCE8] border-[1.5px] border-[#FDE047] flex items-center justify-center mb-1.5 overflow-hidden">
            <Image
              src="/screens_assets/xp_icon.png"
              alt="XP Icon"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-[15px] text-[#382C22] leading-tight">
            {userXp.toLocaleString("id-ID")}
          </span>
          <span className="font-nunito font-bold text-[11px] text-[#796F65]">
            XP
          </span>
        </div>

        {/* Card 3: Koin */}
        <div className="flex flex-col items-center bg-white border-[3px] border-[#382C22] rounded-[22px] p-2.5 shadow-[0_4px_0_#382C22]">
          <div className="w-11 h-11 rounded-2xl bg-[#F0FDF4] border-[1.5px] border-[#86EFAC] flex items-center justify-center mb-1.5 overflow-hidden">
            <Image
              src="/screens_assets/leaf_coin.jpg"
              alt="Koin Icon"
              width={30}
              height={30}
              className="object-contain rounded-full"
            />
          </div>
          <span className="font-fredoka font-black text-[15px] text-[#382C22] leading-tight">
            {(user?.coins ?? 0).toLocaleString("id-ID")}
          </span>
          <span className="font-nunito font-bold text-[11px] text-[#796F65]">
            Koin
          </span>
        </div>

      </div>

      {/* NOTIFICATION TOAST */}
      {equipNotice && (
        <div className="p-2.5 mb-3 bg-[#ecfccb] border-[2px] border-[#65a30d] rounded-2xl font-fredoka font-black text-xs text-[#3f6212] text-center shadow-xs animate-in zoom-in duration-200">
          {equipNotice}
        </div>
      )}

      {/* ── 4. BORDER AVATAR COLLECTION (Only shows Polos + purchased borders) ── */}
      <div className="bg-white border-[3px] border-[#382C22] rounded-[28px] p-4 mb-3.5 shadow-[0_4px_0_#382C22]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="font-fredoka font-extrabold text-[10px] text-[#94a3b8] uppercase tracking-wider">
              BORDER AVATAR
            </span>
            <span className="font-fredoka font-black text-[16px] text-[#382C22]">
              Pasang & Koleksi Border
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/toko")}
            className="text-xs font-fredoka font-black text-[#15803d] bg-[#dcfce7] border-[1.5px] border-[#86efac] px-3 py-1 rounded-xl hover:bg-[#bbf7d0] active:scale-95 transition-transform cursor-pointer"
          >
            + Toko
          </button>
        </div>

        {/* Borders Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          
          {/* Always Owned: Polos */}
          <button
            type="button"
            onClick={() => handleEquipBorder("")}
            className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                !selectedFrame
                  ? "bg-[#ecfccb] border-[3px] border-[#22c55e] shadow-xs scale-105"
                  : "bg-[#f8fafc] border-[2px] border-[#e2e8f0] group-hover:border-[#cbd5e1]"
              }`}
            >
              <Image
                src="/screens_assets/mascot_thumbsup_transparent.png"
                alt="Polos"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span
              className={`font-fredoka text-xs ${
                !selectedFrame ? "font-black text-[#15803d]" : "font-bold text-[#64748b]"
              }`}
            >
              Polos
            </span>
          </button>

          {/* Purchased Owned Borders */}
          {ownedFrames
            .filter((fId) => fId !== "" && BORDERS_CATALOG[fId])
            .map((fId) => {
              const border = BORDERS_CATALOG[fId];
              const isEquipped = selectedFrame === fId;

              return (
                <button
                  key={fId}
                  type="button"
                  onClick={() => handleEquipBorder(fId)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div
                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isEquipped
                        ? "bg-[#ecfccb] border-[3px] border-[#22c55e] shadow-xs scale-105"
                        : "bg-[#f8fafc] border-[2px] border-[#e2e8f0] group-hover:border-[#cbd5e1]"
                    }`}
                  >
                    <Image
                      src="/screens_assets/mascot_thumbsup_transparent.png"
                      alt={border.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none scale-105 flex items-center justify-center"
                      style={{ filter: border.filter || "none" }}
                    >
                      <Image
                        src={border.imageSrc}
                        alt={border.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <span
                    className={`font-fredoka text-xs ${
                      isEquipped ? "font-black text-[#15803d]" : "font-bold text-[#64748b]"
                    }`}
                  >
                    {border.name}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* ── 5. RANK SAAT INI CARD ── */}
      <div className="bg-white border-[3px] border-[#382C22] rounded-[28px] p-4 mb-3.5 shadow-[0_4px_0_#382C22]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col flex-1 pr-3">
            <span className="font-fredoka font-black text-[11px] text-[#ea580c] uppercase tracking-wider mb-0.5">
              RANK SAAT INI
            </span>
            <h3 className="font-fredoka font-black text-[24px] text-[#382C22] leading-tight mb-2">
              {currentRank.name}
            </h3>

            {/* XP Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="bg-[#fad85e] border-[1.5px] border-[#6b3506] text-[#3b1d03] font-fredoka font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                XP
              </span>
              <div className="flex-1 h-3.5 bg-[#f1f5f9] border-[1.5px] border-[#382C22] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#22c55e] to-[#15803d] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 8)}%` }}
                />
              </div>
              <span className="font-fredoka font-black text-xs text-[#382C22] whitespace-nowrap">
                {userXp} / {currentRank.maxXp}
              </span>
            </div>
          </div>

          {/* Large Rank Badge Right */}
          <div className="w-16 h-16 relative flex-shrink-0 flex items-center justify-center">
            <Image
              src={currentRank.badgeImg}
              alt={currentRank.name}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* ── 6. JALUR RANK CARD (All 5 Ranks Connected by Arrows, No Text Cut Off) ── */}
      <div className="bg-white border-[3px] border-[#382C22] rounded-[28px] p-4 shadow-[0_4px_0_#382C22]">
        <h3 className="font-fredoka font-black text-[18px] text-[#382C22] mb-3">
          Jalur Rank
        </h3>

        <div className="flex items-center justify-between w-full overflow-x-auto no-scrollbar py-1">
          {RANK_TIERS.map((tier, idx) => {
            const isCurrent = currentRank.name === tier.name;

            return (
              <React.Fragment key={tier.name}>
                <div className="flex flex-col items-center flex-shrink-0 gap-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? "border-[3px] border-[#f59e0b] ring-2 ring-[#f59e0b] shadow-md scale-105 bg-[#fffbeb]"
                        : "border-[2px] border-[#382C22] bg-[#f8fafc]"
                    }`}
                  >
                    <Image
                      src={tier.badgeImg}
                      alt={tier.name}
                      width={38}
                      height={38}
                      className="object-contain"
                    />
                  </div>

                  <span
                    className={`font-fredoka text-[11.5px] ${
                      isCurrent
                        ? "font-black text-[#0f172a]"
                        : "font-bold text-[#64748b]"
                    }`}
                  >
                    {tier.name}
                  </span>
                </div>

                {idx < RANK_TIERS.length - 1 && (
                  <div className="text-[#9ca3af] font-black text-sm px-0.5 flex-shrink-0">
                    &gt;
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

    </div>
  );
}
