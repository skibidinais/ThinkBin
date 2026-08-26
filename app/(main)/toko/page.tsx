"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserOwnedFrames,
  purchaseFrameTransaction,
  equipFrameInDatabase,
  openMysteryBoxTransaction,
} from "@/lib/supabase";

interface ShopItem {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  description: string;
  filter?: string;
  isMysteryBox?: boolean;
}

const FULL_CATALOG: ShopItem[] = [
  // --- PAGE 1: Sederhana & Guardian ---
  {
    id: "mystery_box",
    name: "Mystery Box",
    price: 40,
    imageSrc: "/assets_game/mystery_box.png",
    description: "Peti misteri berhadiah kejutan koin & XP!",
    isMysteryBox: true,
  },
  {
    id: "eco_green",
    name: "Eco Green Border",
    price: 30,
    imageSrc: "/screens_assets/border1.png",
    description: "Border daun hijau klasik pejuang alam.",
  },
  {
    id: "autumn_forest",
    name: "Autumn Forest Border",
    price: 40,
    imageSrc: "/screens_assets/border1.png",
    filter: "hue-rotate(30deg) saturate(1.2) brightness(0.95)",
    description: "Nuansa hangat hutan musim gugur.",
  },
  {
    id: "sakura_pink",
    name: "Sakura Pink Border",
    price: 50,
    imageSrc: "/screens_assets/border1.png",
    filter: "hue-rotate(240deg) saturate(1.4)",
    description: "Pesona bunga sakura mekar nan cantik.",
  },
  {
    id: "ocean_guardian",
    name: "Ocean Guardian Border",
    price: 60,
    imageSrc: "/screens_assets/border2.png",
    filter: "hue-rotate(180deg) saturate(1.1)",
    description: "Kekuatan ombak samudra biru pelindung bumi.",
  },
  {
    id: "forest_guardian",
    name: "Forest Guardian Border",
    price: 70,
    imageSrc: "/screens_assets/border2.png",
    description: "Penjaga rimba hijau yang kokoh.",
  },

  // --- PAGE 2: Guardian & Crystal ---
  {
    id: "twilight_guardian",
    name: "Twilight Guardian Border",
    price: 85,
    imageSrc: "/screens_assets/border2.png",
    filter: "hue-rotate(90deg) saturate(1.2)",
    description: "Magis senja ungu penjaga lingkungan.",
  },
  {
    id: "crystal_ice",
    name: "Crystal Ice Border",
    price: 100,
    imageSrc: "/screens_assets/border3.png",
    description: "Kristal es dingin berkilau mewah.",
  },
  {
    id: "crystal_amethyst",
    name: "Crystal Amethyst Border",
    price: 115,
    imageSrc: "/screens_assets/border3.png",
    filter: "hue-rotate(70deg) saturate(1.2)",
    description: "Permata ametis ungu memancarkan wibawa.",
  },
  {
    id: "crystal_ruby",
    name: "Crystal Ruby Border",
    price: 130,
    imageSrc: "/screens_assets/border3.png",
    filter: "hue-rotate(220deg) saturate(1.3)",
    description: "Permata rubi merah menyala berani.",
  },
  {
    id: "emerald_royal",
    name: "Emerald Royal Border",
    price: 150,
    imageSrc: "/screens_assets/border4.png",
    description: "Mahkota zamrud kerajaan hijau sejati.",
  },
  {
    id: "sapphire_royal",
    name: "Sapphire Royal Border",
    price: 175,
    imageSrc: "/screens_assets/border4.png",
    filter: "hue-rotate(140deg) saturate(1.2)",
    description: "Mahkota safir biru kemegahan samudera.",
  },

  // --- PAGE 3: Deluxe Special ---
  {
    id: "golden_monarch",
    name: "Golden Monarch Border",
    price: 200,
    imageSrc: "/screens_assets/border4.png",
    filter: "hue-rotate(320deg) brightness(1.1) saturate(1.4)",
    description: "Takhta emas tertinggi pelindung bumi semesta.",
  },
  {
    id: "frame_teal_tech",
    name: "Teal Tech Border",
    price: 65,
    imageSrc: "/assets_game/frame_teal_tech.png",
    description: "Gaya futuristik teknologi ramah lingkungan.",
  },
  {
    id: "frame_blue_crystal",
    name: "Blue Crystal Border",
    price: 90,
    imageSrc: "/assets_game/frame_blue_crystal.png",
    description: "Kristal es biru berkilau edisi terbatas!",
  },
];

const ITEMS_PER_PAGE = 6;
const TOTAL_PAGES = Math.ceil(FULL_CATALOG.length / ITEMS_PER_PAGE);

export default function TokoPage() {
  const { user, updateUser, refreshProfile } = useAuth();
  const [ownedFrames, setOwnedFrames] = useState<string[]>(["frame_teal_tech"]);
  const [selectedFrame, setSelectedFrame] = useState<string>("frame_teal_tech");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    async function loadShopData() {
      if (user?.id) {
        refreshProfile(user.id).catch(() => {});
        const owned = await fetchUserOwnedFrames(user.id);
        setOwnedFrames(owned);
        setSelectedFrame(user.selected_frame || "frame_teal_tech");
      } else {
        try {
          const savedOwned = localStorage.getItem("thinkbin_owned_frames");
          if (savedOwned) {
            setOwnedFrames(JSON.parse(savedOwned));
          }
          const savedSelected = localStorage.getItem("thinkbin_selected_frame") || "frame_teal_tech";
          setSelectedFrame(savedSelected);
        } catch {
          // Fallback
        }
      }
    }
    loadShopData();
  }, [user?.id]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = FULL_CATALOG.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleBuyOrEquip = async (item: ShopItem) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // ── 1. Mystery Box Purchase ──
      if (item.isMysteryBox) {
        const result = await openMysteryBoxTransaction(user?.id || "usr_guest");
        if (result.success) {
          setPurchaseNotice(result.message || `Kamu membuka Mystery Box dan mendapatkan +${result.rewardXp} XP!`);
        } else {
          setPurchaseNotice(result.message || "Koin tidak cukup untuk Mystery Box.");
        }
        // Always refresh profile from database to sync coins/xp
        if (user?.id) {
          await refreshProfile(user.id);
        }
        setTimeout(() => setPurchaseNotice(null), 3500);
        return;
      }

      // ── 2. Border Equip (already owned) ──
      const isOwned = ownedFrames.includes(item.id) || item.id === "frame_teal_tech";

      if (isOwned) {
        if (user?.id) {
          await equipFrameInDatabase(user.id, item.id);
          await refreshProfile(user.id);
        }
        setSelectedFrame(item.id);
        setPurchaseNotice(`Border "${item.name}" berhasil dipasang.`);
        setTimeout(() => setPurchaseNotice(null), 3000);
        return;
      }

      // ── 3. Border Purchase (not owned) ──
      const result = await purchaseFrameTransaction({
        userId: user?.id || "usr_guest",
        frameId: item.id,
        frameName: item.name,
        priceCoins: item.price,
      });

      if (result.success) {
        setPurchaseNotice(result.message || `Border "${item.name}" berhasil dibeli dan terpasang.`);
        // Refresh profile and owned frames from database AFTER successful purchase
        if (user?.id) {
          await refreshProfile(user.id);
          const freshOwned = await fetchUserOwnedFrames(user.id);
          setOwnedFrames(freshOwned);
          setSelectedFrame(item.id);
        }
      } else {
        setPurchaseNotice(result.message || "Gagal memproses transaksi.");
        // Still refresh to ensure coins display is accurate
        if (user?.id) {
          await refreshProfile(user.id);
        }
      }
      setTimeout(() => setPurchaseNotice(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-full flex flex-col items-center justify-between select-none overflow-hidden bg-[#F7E7B4]">
      {/* ── BACKGROUND IMAGE (Clean Market Stall Scene without baked pills / navbar) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Image
          src="/screens_assets/shop_clean_background.jpg"
          alt="Toko Background Market Stall"
          fill
          priority
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover object-center"
        />
      </div>

      {/* ── CENTRAL INTERACTIVE CONTENT LAYER ── */}
      <div className="relative z-10 w-full max-w-[390px] h-full flex flex-col justify-between pt-2.5 pb-24 px-3.5">
        
        {/* ── 1. SINGLE LIVE TOP STAT BAR (Streak / XP / Koin) ── */}
        <div className="flex items-center justify-between w-full px-1 flex-shrink-0 z-20">
          {/* Streak Pill */}
          <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] rounded-full px-3 py-1 shadow-[0_2.5px_0_#382C22]">
            <Image
              src="/screens_assets/streak_icon.png"
              alt="Streak"
              width={18}
              height={18}
              className="object-contain"
            />
            <span className="font-fredoka font-black text-xs text-[#382C22]">
              {user?.streak ?? 1} Hari
            </span>
          </div>

          {/* XP Pill */}
          <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] rounded-full px-3 py-1 shadow-[0_2.5px_0_#382C22]">
            <Image
              src="/screens_assets/xp_icon.png"
              alt="XP"
              width={16}
              height={16}
              className="object-contain"
            />
            <span className="font-fredoka font-black text-xs text-[#382C22]">
              {user?.xp ?? 0} XP
            </span>
          </div>

          {/* Coin Pill */}
          <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] rounded-full px-3 py-1 shadow-[0_2.5px_0_#382C22]">
            <Image
              src="/screens_assets/coin.png"
              alt="Coin"
              width={18}
              height={18}
              className="object-contain"
            />
            <span className="font-fredoka font-black text-xs text-[#382C22]">
              {user?.coins ?? 0}
            </span>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {purchaseNotice && (
          <div className="p-1.5 mt-1 bg-emerald-100 border-[2px] border-[#15803D] rounded-xl font-fredoka font-bold text-[11px] text-[#15803D] text-center shadow-md animate-in zoom-in duration-200 z-30">
            {purchaseNotice}
          </div>
        )}

        {/* ── 2. GRID OF 6 ITEM CARDS (Positioned lower below the Toko header sign) ── */}
        <div className="grid grid-cols-3 gap-2.5 mt-24 sm:mt-28 mb-2 flex-shrink-0 z-10">
          {currentItems.map((item) => {
            const isOwned = ownedFrames.includes(item.id);
            const isEquipped = selectedFrame === item.id;

            return (
              <div
                key={item.id}
                className={`flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-2xl p-1.5 shadow-[0_3.5px_0_#382C22] relative transition-transform ${
                  isEquipped ? "ring-2 ring-[#4CAF50]" : ""
                }`}
              >
                {isEquipped && (
                  <span className="absolute -top-2 right-1 bg-[#4CAF50] text-white font-fredoka font-bold text-[7.5px] px-1.5 py-0.2 rounded-full shadow-xs border border-[#2E7D32]">
                    Terpasang
                  </span>
                )}

                {/* Item Icon / Preview */}
                <div className="relative w-12 h-12 my-0.5 flex items-center justify-center">
                  {!item.isMysteryBox ? (
                    <>
                      <Image
                        src="/screens_assets/mascot_thumbsup_transparent.png"
                        alt="Avatar"
                        width={34}
                        height={34}
                        className="rounded-full object-cover"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ filter: item.filter || "none" }}
                      >
                        <Image
                          src={item.imageSrc}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </>
                  ) : (
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      width={42}
                      height={42}
                      className="object-contain"
                    />
                  )}
                </div>

                <span className="font-fredoka font-bold text-[10px] text-[#382C22] text-center truncate w-full mb-1">
                  {item.name}
                </span>

                {/* Yellow Pill Buy/Equip Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleBuyOrEquip(item)}
                  className={`w-full py-1 px-1 rounded-full font-fredoka font-extrabold text-[10px] flex items-center justify-center gap-1 border-[1.5px] border-[#382C22] shadow-[0_2px_0_#382C22] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                    isEquipped
                      ? "bg-[#4CAF50] text-white"
                      : isOwned
                      ? "bg-[#1CB0F6] text-white"
                      : "bg-gradient-to-b from-[#FED54A] to-[#F5B82E] text-[#382C22]"
                  }`}
                >
                  {isEquipped ? (
                    <span>✓ Terpasang</span>
                  ) : isOwned ? (
                    <span>Pasang</span>
                  ) : (
                    <>
                      <Image
                        src="/screens_assets/coin.png"
                        alt="Coin"
                        width={12}
                        height={12}
                        className="object-contain"
                      />
                      <span>{item.price} Koin</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── 3. PAGINATION CONTROLS PILL (< 1 / 3 >) ELEVATED CLEANLY ABOVE BOTTOM DOCK ── */}
        <div className="flex items-center justify-center gap-2 mb-2 flex-shrink-0 z-20">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-full bg-white border-[2.5px] border-[#382C22] flex items-center justify-center font-fredoka font-black text-sm text-[#382C22] shadow-[0_2.5px_0_#382C22] disabled:opacity-35 active:translate-y-0.5 cursor-pointer"
          >
            ‹
          </button>

          <div className="bg-white border-[2.5px] border-[#382C22] rounded-full px-5 py-1 font-fredoka font-black text-xs text-[#382C22] shadow-[0_2.5px_0_#382C22]">
            {currentPage} / {TOTAL_PAGES}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
            disabled={currentPage === TOTAL_PAGES}
            className="w-8 h-8 rounded-full bg-white border-[2.5px] border-[#382C22] flex items-center justify-center font-fredoka font-black text-sm text-[#382C22] shadow-[0_2.5px_0_#382C22] disabled:opacity-35 active:translate-y-0.5 cursor-pointer"
          >
            ›
          </button>
        </div>

      </div>
    </div>
  );
}
