"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserOwnedFrames,
  purchaseFrameTransaction,
  equipFrameInDatabase,
} from "@/lib/supabase";

interface ShopFrame {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  description: string;
}

const SHOP_FRAMES: ShopFrame[] = [
  {
    id: "frame_teal_tech",
    name: "Teal Tech",
    price: 200,
    imageSrc: "/assets_game/frame_teal_tech.png",
    description: "Border futuristik bergaya teknologi canggih!",
  },
  {
    id: "frame_blue_crystal",
    name: "Blue Crystal",
    price: 350,
    imageSrc: "/assets_game/frame_blue_crystal.png",
    description: "Kristal es biru berkilau yang elegan!",
  },
  {
    id: "frame_green_leafy",
    name: "Green Leafy",
    price: 150,
    imageSrc: "/assets_game/frame_green_leafy.png",
    description: "Daun segar lambang pejuang lingkungan sejati!",
  },
  {
    id: "frame_dark_teal_gold",
    name: "Teal Gold Deluxe",
    price: 500,
    imageSrc: "/assets_game/frame_dark_teal_gold.png",
    description: "Aksen emas mewah untuk juara kelas!",
  },
];

export default function TokoPage() {
  const { user, updateUser } = useAuth();
  const [ownedFrames, setOwnedFrames] = useState<string[]>(["frame_teal_tech"]);
  const [selectedFrame, setSelectedFrame] = useState<string>("frame_teal_tech");
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadShopData() {
      setIsLoading(true);
      try {
        if (user?.id) {
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
      } finally {
        setIsLoading(false);
      }
    }
    loadShopData();
  }, [user]);

  const handleBuyOrEquip = async (frame: ShopFrame) => {
    const isOwned = ownedFrames.includes(frame.id);

    if (isOwned) {
      // Equip frame in Supabase & Local
      if (user?.id) {
        await equipFrameInDatabase(user.id, frame.id);
      }
      setSelectedFrame(frame.id);
      updateUser({ selected_frame: frame.id });
      setPurchaseNotice(`✨ Frame "${frame.name}" berhasil dipasang pada profilmu!`);
      setTimeout(() => setPurchaseNotice(null), 3000);
    } else {
      // Buy frame in Supabase & Local
      const currentCoins = user?.coins ?? 0;
      if (currentCoins < frame.price) {
        setPurchaseNotice(`⚠️ Koin Daun tidak cukup! Kamu membutuhkan ${frame.price} koin.`);
        setTimeout(() => setPurchaseNotice(null), 3000);
        return;
      }

      if (user?.id) {
        const result = await purchaseFrameTransaction({
          userId: user.id,
          frameId: frame.id,
          frameName: frame.name,
          priceCoins: frame.price,
        });

        if (!result.success) {
          setPurchaseNotice(`⚠️ ${result.message || "Gagal memproses transaksi!"}`);
          setTimeout(() => setPurchaseNotice(null), 3000);
          return;
        }
      }

      const newCoins = currentCoins - frame.price;
      const newOwned = [...ownedFrames, frame.id];
      setOwnedFrames(newOwned);
      setSelectedFrame(frame.id);

      updateUser({
        coins: newCoins,
        selected_frame: frame.id,
      });

      setPurchaseNotice(`🎉 Selamat! Frame "${frame.name}" berhasil dibeli dan langsung terpasang!`);
      setTimeout(() => setPurchaseNotice(null), 3000);
    }
  };

  return (
    <div className="relative flex flex-col min-h-full px-4 pt-3 pb-16 select-none bg-gradient-to-b from-[#FFFDF9] to-[#F5E6CC]">
      {/* HEADER WITH COIN BALANCE */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-fredoka font-extrabold text-xl text-[#382C22]">
          🛍️ Toko Frame Profil
        </h1>
        <div className="flex items-center gap-1.5 bg-white border-[2px] border-[#E5E5E5] px-3 py-1 rounded-full shadow-xs">
          <Image src="/assets_game/coin.png" alt="Coin" width={18} height={18} className="object-contain" />
          <span className="font-fredoka font-extrabold text-xs text-[#F57F17]">
            {user?.coins ?? 0} Koin
          </span>
        </div>
      </div>

      {/* MASCOT GREETING BANNER */}
      <div className="flex items-center gap-3 bg-[#FFF8E7] border-[2.5px] border-[#F5B82E] rounded-2xl p-3 mb-4 shadow-xs">
        <div className="relative w-14 h-14 flex-shrink-0">
          <Image
            src="/assets/mascot_leonardo.png"
            alt="Mascot"
            width={56}
            height={56}
            className="object-contain"
          />
        </div>
        <p className="font-nunito font-bold text-xs text-[#713F12] leading-tight">
          Halo! Kumpulkan Koin Daun dari belajar dan kuis untuk menghias avatarmu dengan border eksklusif!
        </p>
      </div>

      {/* PURCHASE / ACTION NOTIFICATION */}
      {purchaseNotice && (
        <div className="p-3 mb-4 bg-green-50 border-[2px] border-green-300 rounded-xl font-nunito font-bold text-xs text-green-800 text-center animate-in zoom-in duration-200">
          {purchaseNotice}
        </div>
      )}

      {/* SKELETON LOADING STATE OR 3D WOODEN SHELVES GRID */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3.5 pb-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-white/70 border-[3px] border-[#E5E5E5] rounded-3xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 pb-6">
          {SHOP_FRAMES.map((frame) => {
            const isOwned = ownedFrames.includes(frame.id);
            const isEquipped = selectedFrame === frame.id;

            return (
              <div
                key={frame.id}
                className={`flex flex-col items-center bg-white border-[3px] border-b-[6px] rounded-3xl p-3.5 shadow-md relative transition-all ${
                  isEquipped
                    ? "border-[#58CC02] bg-[#F4FBF0]"
                    : "border-[#8B5A2B]"
                }`}
              >
                {/* Equipped Badge */}
                {isEquipped && (
                  <span className="absolute top-2 right-2 bg-[#58CC02] text-white font-fredoka font-bold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                    Terpasang
                  </span>
                )}

                {/* Frame Preview with Avatar inside */}
                <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                  <Image
                    src="/assets/mascot_leonardo.png"
                    alt="Avatar Preview"
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <Image
                      src={frame.imageSrc}
                      alt={frame.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Title & Desc */}
                <span className="font-fredoka font-extrabold text-xs text-[#382C22] text-center mt-1">
                  {frame.name}
                </span>
                <p className="font-nunito font-semibold text-[10px] text-[#796F65] text-center line-clamp-1 mb-3">
                  {frame.description}
                </p>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => handleBuyOrEquip(frame)}
                  className={`w-full py-2 px-2 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 transition-all cursor-pointer ${
                    isEquipped
                      ? "bg-[#58CC02] text-white border border-[#4CAF00] cursor-default"
                      : isOwned
                      ? "bg-[#1CB0F6] hover:bg-[#1899D6] text-white border border-[#1899D6]"
                      : "bg-[#FFA800] hover:bg-[#F57F17] text-white border border-[#D39A1C]"
                  }`}
                >
                  {isEquipped ? (
                    <span>✓ Digunakan</span>
                  ) : isOwned ? (
                    <span>Pasang Frame</span>
                  ) : (
                    <>
                      <Image src="/assets_game/coin.png" alt="Coin" width={14} height={14} />
                      <span>{frame.price} Koin</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
