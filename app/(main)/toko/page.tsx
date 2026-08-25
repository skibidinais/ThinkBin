"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserOwnedFrames,
  purchaseFrameTransaction,
  equipFrameInDatabase,
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
    imageSrc: "/assets_game/border1.png",
    description: "Border daun hijau klasik pejuang alam.",
  },
  {
    id: "autumn_forest",
    name: "Autumn Forest Border",
    price: 40,
    imageSrc: "/assets_game/border1.png",
    filter: "hue-rotate(30deg) saturate(1.2) brightness(0.95)",
    description: "Nuansa hangat hutan musim gugur.",
  },
  {
    id: "sakura_pink",
    name: "Sakura Pink Border",
    price: 50,
    imageSrc: "/assets_game/border1.png",
    filter: "hue-rotate(240deg) saturate(1.4)",
    description: "Pesona bunga sakura mekar nan cantik.",
  },
  {
    id: "ocean_guardian",
    name: "Ocean Guardian Border",
    price: 60,
    imageSrc: "/assets_game/border2.png",
    filter: "hue-rotate(180deg) saturate(1.1)",
    description: "Kekuatan ombak samudra biru pelindung bumi.",
  },
  {
    id: "forest_guardian",
    name: "Forest Guardian Border",
    price: 70,
    imageSrc: "/assets_game/border2.png",
    description: "Penjaga rimba hijau yang kokoh.",
  },

  // --- PAGE 2: Guardian & Crystal ---
  {
    id: "twilight_guardian",
    name: "Twilight Guardian Border",
    price: 85,
    imageSrc: "/assets_game/border2.png",
    filter: "hue-rotate(90deg) saturate(1.2)",
    description: "Magis senja ungu penjaga lingkungan.",
  },
  {
    id: "crystal_ice",
    name: "Crystal Ice Border",
    price: 100,
    imageSrc: "/assets_game/border3.png",
    description: "Kristal es dingin berkilau mewah.",
  },
  {
    id: "crystal_amethyst",
    name: "Crystal Amethyst Border",
    price: 115,
    imageSrc: "/assets_game/border3.png",
    filter: "hue-rotate(70deg) saturate(1.2)",
    description: "Permata ametis ungu memancarkan wibawa.",
  },
  {
    id: "crystal_ruby",
    name: "Crystal Ruby Border",
    price: 130,
    imageSrc: "/assets_game/border3.png",
    filter: "hue-rotate(220deg) saturate(1.3)",
    description: "Kilau rubi merah menyala penuh semangat.",
  },
  {
    id: "emerald_royal",
    name: "Emerald Royal Border",
    price: 150,
    imageSrc: "/assets_game/border4.png",
    description: "Mahkota zamrud kerajaan hijau sejati.",
  },
  {
    id: "sapphire_royal",
    name: "Sapphire Royal Border",
    price: 170,
    imageSrc: "/assets_game/border4.png",
    filter: "hue-rotate(140deg) saturate(1.2)",
    description: "Safir biru bangsawan pelindung bumi.",
  },

  // --- PAGE 3: Deluxe Special ---
  {
    id: "golden_monarch",
    name: "Golden Monarch Border",
    price: 200,
    imageSrc: "/assets_game/border4.png",
    filter: "hue-rotate(320deg) brightness(1.1) saturate(1.4)",
    description: "Aksen emas raja untuk sang juara sejati.",
  },
  {
    id: "frame_teal_tech",
    name: "Teal Tech Deluxe",
    price: 220,
    imageSrc: "/assets_game/frame_teal_tech.png",
    description: "Border futuristik teknologi canggih!",
  },
  {
    id: "frame_blue_crystal",
    name: "Blue Crystal Deluxe",
    price: 250,
    imageSrc: "/assets_game/frame_blue_crystal.png",
    description: "Kristal es biru berkilau edisi terbatas!",
  },
];

const ITEMS_PER_PAGE = 6;
const TOTAL_PAGES = Math.ceil(FULL_CATALOG.length / ITEMS_PER_PAGE);

export default function TokoPage() {
  const { user, updateUser } = useAuth();
  const [ownedFrames, setOwnedFrames] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadShopData() {
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
    loadShopData();
  }, [user]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = FULL_CATALOG.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleBuyOrEquip = async (item: ShopItem) => {
    if (item.isMysteryBox) {
      const currentCoins = user?.coins ?? 0;
      if (currentCoins < item.price) {
        setPurchaseNotice(`⚠️ Koin tidak cukup untuk Mystery Box!`);
        setTimeout(() => setPurchaseNotice(null), 3000);
        return;
      }
      const rewardXp = Math.floor(Math.random() * 25) + 15;
      const newCoins = currentCoins - item.price;
      const newXp = (user?.xp ?? 0) + rewardXp;
      updateUser({ coins: newCoins, xp: newXp });
      setPurchaseNotice(`🎁 Kamu membuka Mystery Box dan mendapatkan +${rewardXp} XP!`);
      setTimeout(() => setPurchaseNotice(null), 4000);
      return;
    }

    const isOwned = ownedFrames.includes(item.id);

    if (isOwned) {
      if (user?.id) {
        await equipFrameInDatabase(user.id, item.id);
      }
      setSelectedFrame(item.id);
      updateUser({ selected_frame: item.id });
      setPurchaseNotice(`✨ Border "${item.name}" berhasil dipasang!`);
      setTimeout(() => setPurchaseNotice(null), 3000);
    } else {
      const currentCoins = user?.coins ?? 0;
      if (currentCoins < item.price) {
        setPurchaseNotice(`⚠️ Koin tidak cukup! Perlu ${item.price} koin.`);
        setTimeout(() => setPurchaseNotice(null), 3000);
        return;
      }

      if (user?.id) {
        const result = await purchaseFrameTransaction({
          userId: user.id,
          frameId: item.id,
          frameName: item.name,
          priceCoins: item.price,
        });

        if (!result.success) {
          setPurchaseNotice(`⚠️ ${result.message || "Gagal memproses transaksi!"}`);
          setTimeout(() => setPurchaseNotice(null), 3000);
          return;
        }
      }

      const newCoins = currentCoins - item.price;
      const newOwned = [...ownedFrames, item.id];
      setOwnedFrames(newOwned);
      setSelectedFrame(item.id);

      updateUser({
        coins: newCoins,
        selected_frame: item.id,
      });

      setPurchaseNotice(`🎉 Border "${item.name}" berhasil dibeli dan terpasang!`);
      setTimeout(() => setPurchaseNotice(null), 3000);
    }
  };

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full min-h-full px-3 pt-24 pb-24 select-none bg-cover bg-center bg-no-repeat overflow-y-auto no-scrollbar"
      style={{ backgroundImage: "url('/screens_assets/shop_market_bg_official.jpg')" }}
    >
      {/* 1. FLOATING SPEECH BUBBLE BANNER (Positioned below the awning & Toko sign) */}
      <div className="flex items-center gap-2 bg-white/95 border-[2px] border-[#D19932] rounded-3xl p-2.5 mb-2 shadow-[0_4px_10px_rgba(180,120,30,0.15)] flex-shrink-0">
        <div className="relative w-11 h-11 flex-shrink-0">
          <Image
            src="/assets/mascot_leonardo.png"
            alt="Mascot"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="font-fredoka font-bold text-[11.5px] text-[#382C22] leading-snug">
            Halo! Yuk hias profilmu dengan Border Profil ThinkBin yang unik!
          </p>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {purchaseNotice && (
        <div className="p-2 mb-2 bg-emerald-100 border-[2px] border-[#15803D] rounded-2xl font-fredoka font-bold text-xs text-[#15803D] text-center shadow-md animate-in zoom-in duration-200">
          {purchaseNotice}
        </div>
      )}

      {/* 2. 3x2 STORE ITEM CARDS (Positioned cleanly in the open cream center wall area) */}
      <div className="grid grid-cols-3 gap-2 mb-2 flex-shrink-0">
        {currentItems.map((item) => {
          const isOwned = ownedFrames.includes(item.id);
          const isEquipped = selectedFrame === item.id;

          return (
            <div
              key={item.id}
              className={`flex flex-col items-center bg-white border-[2px] border-[#E8DCC2] rounded-2xl p-2 shadow-[0_4px_12px_rgba(150,110,30,0.12)] relative transition-transform ${
                isEquipped ? "ring-2 ring-[#4CAF50]" : ""
              }`}
            >
              {isEquipped && (
                <span className="absolute -top-1.5 right-1 bg-[#4CAF50] text-white font-fredoka font-bold text-[8px] px-1.5 py-0.2 rounded-full shadow-xs">
                  Terpasang
                </span>
              )}

              {/* Item Preview */}
              <div className="relative w-14 h-14 my-0.5 flex items-center justify-center">
                {!item.isMysteryBox ? (
                  <>
                    <Image
                      src="/assets/mascot_leonardo.png"
                      alt="Avatar"
                      width={38}
                      height={38}
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
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                )}
              </div>

              <span className="font-fredoka font-bold text-[10.5px] text-[#382C22] text-center truncate w-full mb-1">
                {item.name}
              </span>

              {/* Yellow Pill Buy/Equip Button */}
              <button
                type="button"
                onClick={() => handleBuyOrEquip(item)}
                className={`w-full py-1.5 px-1 rounded-full font-fredoka font-extrabold text-[11px] flex items-center justify-center gap-1 border-[1.5px] border-[#D4981C] shadow-[0_2.5px_0_#C2870F] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                  isEquipped
                    ? "bg-[#4CAF50] border-[#388E3C] shadow-[0_2.5px_0_#2E7D32] text-white"
                    : isOwned
                    ? "bg-[#1CB0F6] border-[#0284C7] shadow-[0_2.5px_0_#0369A1] text-white"
                    : "bg-gradient-to-b from-[#FED54A] to-[#F5B82E] text-[#633E04]"
                }`}
              >
                {isEquipped ? (
                  <span>✓ Digunakan</span>
                ) : isOwned ? (
                  <span>Pasang</span>
                ) : (
                  <>
                    <Image
                      src="/screens_assets/coin.png"
                      alt="Coin"
                      width={13}
                      height={13}
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

      {/* 3. PAGINATION CONTROLS PILL (< 1 / 3 >) */}
      <div className="flex items-center justify-center gap-2 mb-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-full bg-white border-[1.5px] border-[#D4981C] flex items-center justify-center font-fredoka font-black text-sm text-[#633E04] shadow-[0_2px_0_#C2870F] disabled:opacity-30 active:translate-y-0.5 cursor-pointer"
        >
          ‹
        </button>

        <div className="bg-white border-[1.5px] border-[#D4981C] rounded-full px-5 py-1 font-fredoka font-black text-xs text-[#633E04] shadow-[0_2px_0_#C2870F]">
          {currentPage} / {TOTAL_PAGES}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          disabled={currentPage === TOTAL_PAGES}
          className="w-8 h-8 rounded-full bg-white border-[1.5px] border-[#D4981C] flex items-center justify-center font-fredoka font-black text-sm text-[#633E04] shadow-[0_2px_0_#C2870F] disabled:opacity-30 active:translate-y-0.5 cursor-pointer"
        >
          ›
        </button>
      </div>

      {/* BOTTOM SAFE AREA SPACER */}
      <div className="w-full h-4 flex-shrink-0" />
    </div>
  );
}
