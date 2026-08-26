"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [equipNotice, setEquipNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      // Load custom photo if saved
      try {
        const savedPhoto = localStorage.getItem("thinkbin_user_photo");
        if (savedPhoto) {
          setUserPhoto(savedPhoto);
        }
      } catch {
        // ignore
      }

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setUserPhoto(dataUrl);
          try {
            localStorage.setItem("thinkbin_user_photo", dataUrl);
          } catch {
            // ignore
          }
          setEquipNotice("Foto profil berhasil diperbarui!");
          setTimeout(() => setEquipNotice(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const equippedConfig = selectedFrame ? BORDERS_CATALOG[selectedFrame] : null;

  return (
    <div
      className="relative flex flex-col w-full min-h-full px-4 pt-3 pb-36 select-none bg-[#FDE8A5] overflow-y-auto overscroll-y-contain"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      
      {/* ── 1. HEADER (Back Button & Title) ── */}
      <header className="flex items-center gap-3 mb-3 pt-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-[16px] bg-white border-[2.5px] border-[#382C22] shadow-[0_3px_0_#382C22] active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer transition-transform flex-shrink-0"
          aria-label="Kembali"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#382C22" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="font-fredoka font-black text-[24px] text-[#382C22] tracking-tight">
          Profil Saya
        </h1>
      </header>

      {/* Hidden File Input for Avatar Photo */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* ── 2. CARD 1: PROFILE HERO BANNER CARD (Full Landscape Background, Avatar, Name, Level Bar) ── */}
      <div className="relative w-full min-h-[220px] bg-[#E8F5E9] border-[2.5px] border-[#382C22] rounded-[24px] overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.05)] mb-3 flex flex-col items-center justify-center flex-shrink-0">
        
        {/* Full Card Landscape Cover Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <Image
            src="/screens_assets/hero_bg.jpg"
            alt="Profile Landscape Banner"
            fill
            priority
            className="object-cover object-bottom"
          />
        </div>

        {/* Hero Card Content Layer */}
        <div className="relative z-10 w-full py-6 px-4 flex flex-col items-center justify-center text-center">
          
          {/* Avatar Container with Frame Overlay & Camera Edit Button */}
          <div className="relative w-[94px] h-[94px] mb-2 flex items-center justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-[68px] h-[68px] rounded-[16px] bg-white border-[2px] border-[#382C22] flex items-center justify-center overflow-hidden shadow-sm cursor-pointer"
            >
              {userPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userPhoto}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/screens_assets/mascot_thumbsup_transparent.png"
                  alt="User Avatar"
                  width={54}
                  height={54}
                  className="object-contain"
                />
              )}
            </div>

            {/* Equipped Avatar Border Frame Overlay */}
            {equippedConfig && (
              <div
                className="absolute inset-0 pointer-events-none scale-105 flex items-center justify-center z-20"
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-7 h-7 bg-[#4CAF50] border-[2px] border-[#382C22] rounded-[10px] shadow-[0_2px_0_#318B35] flex items-center justify-center cursor-pointer z-30 active:translate-y-0.5"
              title="Upload Foto"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          {/* User Display Name */}
          <h2 className="font-fredoka font-black text-[22px] text-[#1F2937] text-center leading-tight mb-2.5 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
            {user?.display_name || user?.email?.split("@")[0] || ""}
          </h2>

          {/* Centered Level Progress Bar Container */}
          <div className="w-full max-w-[280px] bg-white/95 backdrop-blur-xs border-[1.5px] border-[#382C22] rounded-[14px] px-3.5 py-1.5 shadow-[0_2px_0_#382C22] flex flex-col items-center gap-1">
            <div className="w-full h-3 bg-[#E5E7EB] border-[1.5px] border-[#382C22] rounded-[8px] overflow-hidden p-0.5">
              <div
                className="h-full bg-[#F5B82E] rounded-[6px] transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 10)}%` }}
              />
            </div>
            <span className="font-fredoka font-black text-[11px] text-[#382C22]">
              {userXp} / {currentRank.maxXp} XP
            </span>
          </div>

        </div>
      </div>

      {/* ── 3. CARD 2: THREE SEPARATE SQUARE STATS CARDS (Streak, XP, Koin) ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 flex-shrink-0">
        
        {/* Square 1: Streak */}
        <div className="flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-[22px] p-3 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
          <div className="w-12 h-12 rounded-[16px] bg-[#FFF0E6] border-[2px] border-[#382C22] shadow-[0_2.5px_0_#382C22] flex items-center justify-center mb-1.5 overflow-hidden">
            <Image
              src="/screens_assets/streak_icon.png"
              alt="Streak Icon"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-[16px] text-[#382C22] leading-tight">
            {user?.streak ?? 1} Hari
          </span>
          <span className="font-fredoka font-bold text-[11px] text-[#796F65]">
            Streak
          </span>
        </div>

        {/* Square 2: XP */}
        <div className="flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-[22px] p-3 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
          <div className="w-12 h-12 rounded-[16px] bg-[#FFF7E6] border-[2px] border-[#382C22] shadow-[0_2.5px_0_#382C22] flex items-center justify-center mb-1.5 overflow-hidden">
            <Image
              src="/screens_assets/xp_icon.png"
              alt="XP Icon"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <span className="font-fredoka font-black text-[16px] text-[#382C22] leading-tight">
            {userXp.toLocaleString("id-ID")}
          </span>
          <span className="font-fredoka font-bold text-[11px] text-[#796F65]">
            XP
          </span>
        </div>

        {/* Square 3: Koin */}
        <div className="flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-[22px] p-3 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
          <div className="w-12 h-12 rounded-[16px] bg-[#EEF8EC] border-[2px] border-[#382C22] shadow-[0_2.5px_0_#382C22] flex items-center justify-center mb-1.5 overflow-hidden">
            <Image
              src="/screens_assets/leaf_coin.jpg"
              alt="Coin Icon"
              width={30}
              height={30}
              className="object-contain rounded-full"
            />
          </div>
          <span className="font-fredoka font-black text-[16px] text-[#382C22] leading-tight">
            {(user?.coins ?? 0).toLocaleString("id-ID")}
          </span>
          <span className="font-fredoka font-bold text-[11px] text-[#796F65]">
            Koin
          </span>
        </div>

      </div>

      {/* NOTIFICATION TOAST */}
      {equipNotice && (
        <div className="p-2 mb-2 bg-[#ecfccb] border-[2px] border-[#65a30d] rounded-2xl font-fredoka font-black text-xs text-[#3f6212] text-center shadow-xs animate-in zoom-in duration-200 flex-shrink-0">
          {equipNotice}
        </div>
      )}

      {/* ── 4. CARD 2.5: BORDER AVATAR COLLECTION (Pasang & Koleksi Border) ── */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-[24px] p-4 mb-3 shadow-[0_4px_0_rgba(0,0,0,0.05)] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="font-fredoka font-black text-[11px] text-[#796F65] uppercase tracking-wider">
              BORDER AVATAR
            </span>
            <span className="font-fredoka font-black text-[17px] text-[#382C22]">
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

        {/* Borders Row (Shows Polos + Owned/Purchased Borders) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          
          {/* Always Owned: Polos */}
          <button
            type="button"
            onClick={() => handleEquipBorder("")}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div
              className={`relative w-15 h-15 rounded-[18px] flex items-center justify-center transition-all ${
                !selectedFrame
                  ? "bg-[#ecfccb] border-[3px] border-[#22c55e] shadow-xs scale-105"
                  : "bg-[#f8fafc] border-[2px] border-[#e2e8f0] group-hover:border-[#cbd5e1]"
              }`}
            >
              {userPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userPhoto}
                  alt="Polos"
                  className="w-9 h-9 object-cover rounded-[10px]"
                />
              ) : (
                <Image
                  src="/screens_assets/mascot_thumbsup_transparent.png"
                  alt="Polos"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              )}
            </div>
            <span
              className={`font-fredoka text-[12px] ${
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
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div
                    className={`relative w-15 h-15 rounded-[18px] flex items-center justify-center transition-all ${
                      isEquipped
                        ? "bg-[#ecfccb] border-[3px] border-[#22c55e] shadow-xs scale-105"
                        : "bg-[#f8fafc] border-[2px] border-[#e2e8f0] group-hover:border-[#cbd5e1]"
                    }`}
                  >
                    {userPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userPhoto}
                        alt={border.name}
                        className="w-8 h-8 object-cover rounded-[8px]"
                      />
                    ) : (
                      <Image
                        src="/screens_assets/mascot_thumbsup_transparent.png"
                        alt={border.name}
                        width={34}
                        height={34}
                        className="object-contain"
                      />
                    )}
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
                    className={`font-fredoka text-[12px] ${
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

      {/* ── 5. CARD 3: RANK SAAT INI CARD ── */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-[24px] p-4 mb-3 shadow-[0_4px_0_rgba(0,0,0,0.05)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col flex-1 pr-3">
            <span className="font-fredoka font-black text-[11px] text-[#D97706] uppercase tracking-wider mb-0.5">
              RANK SAAT INI
            </span>
            <h3 className="font-fredoka font-black text-[26px] text-[#382C22] leading-tight mb-2.5">
              {currentRank.name}
            </h3>

            {/* XP Progress Bar Track */}
            <div className="flex items-center gap-2">
              <span className="bg-[#F5B82E] border-[1.5px] border-[#382C22] text-[#4D3300] font-fredoka font-black text-[10px] px-2 py-0.5 rounded-[8px] shadow-xs">
                XP
              </span>
              <div className="flex-1 h-3.5 bg-[#F1EBE3] border-[2px] border-[#382C22] rounded-[10px] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#4CAF50] rounded-[8px] transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 10)}%` }}
                />
              </div>
              <span className="font-fredoka font-black text-xs text-[#382C22] whitespace-nowrap">
                {userXp} / {currentRank.maxXp}
              </span>
            </div>
          </div>

          {/* Right Large Round Badge */}
          <div className="w-[72px] h-[72px] min-w-[72px] min-h-[72px] relative flex-shrink-0 flex items-center justify-center">
            <Image
              src={currentRank.badgeImg}
              alt={currentRank.name}
              width={72}
              height={72}
              className="object-cover rounded-full border-[3px] border-[#382C22] shadow-[0_3.5px_0_#382C22]"
            />
          </div>
        </div>
      </div>

      {/* ── 6. CARD 4: JALUR RANK CARD (All 5 Ranks with Arrows & Gold Highlight on Current) ── */}
      <div className="bg-white border-[2.5px] border-[#382C22] rounded-[24px] p-4 shadow-[0_4px_0_rgba(0,0,0,0.05)] flex-shrink-0 mb-4">
        <h3 className="font-fredoka font-black text-[18px] text-[#382C22] mb-3">
          Jalur Rank
        </h3>

        <div className="flex items-center justify-between w-full overflow-x-auto no-scrollbar py-1">
          {RANK_TIERS.map((tier, idx) => {
            const isCurrent = currentRank.name === tier.name;

            return (
              <React.Fragment key={tier.name}>
                <div className="flex flex-col items-center flex-shrink-0 gap-1.5">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? "border-[2.5px] border-[#382C22] shadow-[0_3.5px_0_#382C22] ring-[3.5px] ring-[#F5B82E] scale-110 bg-white"
                        : "border-[2.5px] border-[#382C22] bg-white shadow-[0_3px_0_#382C22]"
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
                    className={`font-fredoka text-[11px] ${
                      isCurrent
                        ? "font-black text-[#1F2937]"
                        : "font-bold text-[#796F65]"
                    }`}
                  >
                    {tier.name}
                  </span>
                </div>

                {idx < RANK_TIERS.length - 1 && (
                  <div className="text-[#9CA3AF] font-black text-sm px-0.5 flex-shrink-0 mb-4">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── 7. BOTTOM SAFE AREA SPACER (Allows full scroll way past bottom navigation dock) ── */}
      <div className="w-full h-32 flex-shrink-0" />

    </div>
  );
}
