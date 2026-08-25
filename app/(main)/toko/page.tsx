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
    description: "Border futuristik teknologi canggih!",
  },
  {
    id: "frame_blue_crystal",
    name: "Blue Crystal",
    price: 350,
    imageSrc: "/assets_game/frame_blue_crystal.png",
    description: "Kristal es biru berkilau elegan!",
  },
  {
    id: "frame_green_leafy",
    name: "Green Leafy",
    price: 150,
    imageSrc: "/assets_game/frame_green_leafy.png",
    description: "Daun segar lambang pejuang hijau!",
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

  useEffect(() => {
    async function loadShopData() {
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
    }
    loadShopData();
  }, [user]);

  const handleBuyOrEquip = async (frame: ShopFrame) => {
    const isOwned = ownedFrames.includes(frame.id);

    if (isOwned) {
      if (user?.id) {
        await equipFrameInDatabase(user.id, frame.id);
      }
      setSelectedFrame(frame.id);
      updateUser({ selected_frame: frame.id });
      setPurchaseNotice(`✨ Frame "${frame.name}" berhasil dipasang!`);
      setTimeout(() => setPurchaseNotice(null), 3000);
    } else {
      const currentCoins = user?.coins ?? 0;
      if (currentCoins < frame.price) {
        setPurchaseNotice(`⚠️ Koin Daun tidak cukup! Perlu ${frame.price} koin.`);
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

      setPurchaseNotice(`🎉 Frame "${frame.name}" berhasil dibeli dan terpasang!`);
      setTimeout(() => setPurchaseNotice(null), 3000);
    }
  };

  return (
    <div className="relative flex flex-col min-h-full px-4 pt-3 pb-24 select-none bg-[#FDE8A5]">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-fredoka font-black text-2xl text-[#382C22]">
          Toko
        </h1>
        <div className="flex items-center gap-2">
          {/* Coin Pill */}
          <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] px-3 py-1 rounded-full shadow-[0_3px_0_#382C22]">
            <Image src="/assets_game/coin.png" alt="Coin" width={18} height={18} className="object-contain" />
            <span className="font-fredoka font-bold text-xs text-[#382C22]">
              {user?.coins ?? 0}
            </span>
          </div>

          {/* XP Pill */}
          <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] px-3 py-1 rounded-full shadow-[0_3px_0_#382C22]">
            <Image src="/assets_game/exp_progress.png" alt="XP" width={16} height={16} className="object-contain" />
            <span className="font-fredoka font-bold text-xs text-[#382C22]">
              {user?.xp ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* MASCOT CHAT BUBBLE BANNER */}
      <div className="flex items-center gap-3 bg-[#FFF9E6] border-[2.5px] border-[#382C22] rounded-3xl p-3.5 mb-5 shadow-[0_4px_0_#382C22]">
        <div className="relative w-14 h-14 flex-shrink-0">
          <Image
            src="/assets/mascot_leonardo.png"
            alt="Mascot"
            width={56}
            height={56}
            className="object-contain"
          />
        </div>
        <div className="bg-white border-[2px] border-[#382C22] rounded-2xl p-2.5 shadow-xs flex-1">
          <p className="font-fredoka font-bold text-xs text-[#382C22] leading-snug">
            Halo! Yuk hias profilmu dengan Border Profil ThinkBin yang unik!
          </p>
        </div>
      </div>

      {/* NOTIFICATION */}
      {purchaseNotice && (
        <div className="p-3 mb-4 bg-emerald-100 border-[2.5px] border-[#15803D] rounded-2xl font-fredoka font-bold text-xs text-[#15803D] text-center shadow-xs animate-in zoom-in duration-200">
          {purchaseNotice}
        </div>
      )}

      {/* 3D WOODEN SHELVES GRID */}
      <div className="flex flex-col gap-6 pb-6">
        {/* Row 1 */}
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-3 mb-1">
            {SHOP_FRAMES.slice(0, 2).map((frame) => {
              const isOwned = ownedFrames.includes(frame.id);
              const isEquipped = selectedFrame === frame.id;

              return (
                <div
                  key={frame.id}
                  className={`flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-3xl p-3 shadow-[0_4px_0_#382C22] relative transition-transform ${
                    isEquipped ? "ring-2 ring-[#4CAF50]" : ""
                  }`}
                >
                  {isEquipped && (
                    <span className="absolute top-2 right-2 bg-[#4CAF50] text-white font-fredoka font-bold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                      Terpasang
                    </span>
                  )}

                  {/* Frame Preview */}
                  <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                    <Image
                      src="/assets/mascot_leonardo.png"
                      alt="Avatar Preview"
                      width={52}
                      height={52}
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

                  <span className="font-fredoka font-bold text-xs text-[#382C22] text-center mt-1">
                    {frame.name}
                  </span>
                  <p className="font-nunito font-semibold text-[10px] text-[#796F65] text-center line-clamp-1 mb-2.5">
                    {frame.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleBuyOrEquip(frame)}
                    className={`w-full py-2 px-2 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center gap-1.5 border-[2px] border-[#382C22] shadow-[0_3px_0_#382C22] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                      isEquipped
                        ? "bg-[#4CAF50] text-white"
                        : isOwned
                        ? "bg-[#1CB0F6] text-white"
                        : "bg-[#F5B82E] text-[#382C22]"
                    }`}
                  >
                    {isEquipped ? (
                      <span>✓ Digunakan</span>
                    ) : isOwned ? (
                      <span>Pasang</span>
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
          {/* Wood Bar */}
          <div className="w-full h-3.5 bg-gradient-to-r from-[#D7A667] via-[#C48C4D] to-[#A87334] rounded-full border-[2px] border-[#382C22] shadow-[0_3px_0_#382C22]" />
        </div>

        {/* Row 2 */}
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-3 mb-1">
            {SHOP_FRAMES.slice(2, 4).map((frame) => {
              const isOwned = ownedFrames.includes(frame.id);
              const isEquipped = selectedFrame === frame.id;

              return (
                <div
                  key={frame.id}
                  className={`flex flex-col items-center bg-white border-[2.5px] border-[#382C22] rounded-3xl p-3 shadow-[0_4px_0_#382C22] relative transition-transform ${
                    isEquipped ? "ring-2 ring-[#4CAF50]" : ""
                  }`}
                >
                  {isEquipped && (
                    <span className="absolute top-2 right-2 bg-[#4CAF50] text-white font-fredoka font-bold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                      Terpasang
                    </span>
                  )}

                  {/* Frame Preview */}
                  <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                    <Image
                      src="/assets/mascot_leonardo.png"
                      alt="Avatar Preview"
                      width={52}
                      height={52}
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

                  <span className="font-fredoka font-bold text-xs text-[#382C22] text-center mt-1">
                    {frame.name}
                  </span>
                  <p className="font-nunito font-semibold text-[10px] text-[#796F65] text-center line-clamp-1 mb-2.5">
                    {frame.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleBuyOrEquip(frame)}
                    className={`w-full py-2 px-2 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center gap-1.5 border-[2px] border-[#382C22] shadow-[0_3px_0_#382C22] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                      isEquipped
                        ? "bg-[#4CAF50] text-white"
                        : isOwned
                        ? "bg-[#1CB0F6] text-white"
                        : "bg-[#F5B82E] text-[#382C22]"
                    }`}
                  >
                    {isEquipped ? (
                      <span>✓ Digunakan</span>
                    ) : isOwned ? (
                      <span>Pasang</span>
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
          {/* Wood Bar */}
          <div className="w-full h-3.5 bg-gradient-to-r from-[#D7A667] via-[#C48C4D] to-[#A87334] rounded-full border-[2px] border-[#382C22] shadow-[0_3px_0_#382C22]" />
        </div>
      </div>
    </div>
  );
}
