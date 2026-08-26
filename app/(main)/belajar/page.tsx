"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchUserCompletedNodes } from "@/lib/supabase";

interface MapLevel {
  slotNum: number;
  nodeId: number;
  x: number; // percentage
  y: number; // percentage
  type: string;
  title: string;
  shortTitle: string;
  desc: string;
  xpReward: number;
  coinReward: number;
  icon: "flag" | "dumbbell" | "plus" | "key" | "trophy" | "leaf";
}

interface MapBagian {
  id: number;
  unitSubtitle: string;
  unitTitle: string;
  levels: Record<number, MapLevel>;
}

const MAP_BAGIANS: Record<number, MapBagian> = {
  1: {
    id: 1,
    unitSubtitle: "Bagian 1 • Node 1 - 4",
    unitTitle: "Mengenal Sampah",
    levels: {
      1: { slotNum: 1, nodeId: 1, x: 32.66, y: 43.63, icon: "flag", type: "bacaan", title: "Node 1: Apa itu Sampah & Klasifikasi UU", shortTitle: "Apa itu Sampah & Klasifikasi UU", desc: "Memahami definisi resmi sampah menurut UU No. 18 Tahun 2008.", xpReward: 12, coinReward: 15 },
      2: { slotNum: 2, nodeId: 2, x: 46.39, y: 57.69, icon: "dumbbell", type: "bacaan", title: "Node 2: Sampah Organik: Pengertian, Jenis & Contoh", shortTitle: "Sampah Organik: Pengertian & Contoh", desc: "Mengenal sifat organik basah vs kering di lingkungan sekolah.", xpReward: 12, coinReward: 15 },
      3: { slotNum: 3, nodeId: 3, x: 64.57, y: 68.33, icon: "plus", type: "bacaan", title: "Node 3: Sampah Anorganik: Jenis & Daur Ulang", shortTitle: "Sampah Anorganik: Jenis & Daur Ulang", desc: "Mengenal ragam anorganik bernilai ekonomis.", xpReward: 12, coinReward: 15 },
      4: { slotNum: 4, nodeId: 4, x: 58.46, y: 82.42, icon: "trophy", type: "kuis", title: "Node 4: Kuis Tantangan: Pilah Cepat Organik vs Anorganik", shortTitle: "Kuis Tantangan Pilah Sampah", desc: "Uji ketangkasan memilah sampah cepat dalam 30 detik!", xpReward: 20, coinReward: 25 },
    },
  },
  2: {
    id: 2,
    unitSubtitle: "Bagian 2 • Node 5 - 8",
    unitTitle: "Dampak Sampah bagi Lingkungan",
    levels: {
      1: { slotNum: 1, nodeId: 5, x: 32.66, y: 43.63, icon: "flag", type: "bacaan", title: "Node 5: Bahaya Penumpukan Sampah & Gas Metana", shortTitle: "Bahaya Penumpukan & Gas Metana", desc: "Dampak timbunan sampah terhadap pemanasan global.", xpReward: 12, coinReward: 15 },
      2: { slotNum: 2, nodeId: 6, x: 46.39, y: 57.69, icon: "dumbbell", type: "kuis", title: "Node 6: Kuis Tantangan: Dampak Tanah & Udara", shortTitle: "Kuis Tantangan Dampak Lingkungan", desc: "Klasifikasikan pencemaran tanah, air lindi, dan udara.", xpReward: 20, coinReward: 25 },
      3: { slotNum: 3, nodeId: 7, x: 64.57, y: 68.33, icon: "plus", type: "bacaan", title: "Node 7: Mikroplastik & Rantai Makanan", shortTitle: "Mikroplastik & Rantai Makanan", desc: "Bahaya serpihan plastik mikroskopis pada kesehatan manusia.", xpReward: 12, coinReward: 15 },
      4: { slotNum: 4, nodeId: 8, x: 58.46, y: 82.42, icon: "trophy", type: "bacaan", title: "Node 8: Kebakaran & Pencemaran Dioksin TPA", shortTitle: "Kebakaran & Pencemaran Dioksin", desc: "Racun dioksin dan furan akibat pembakaran terbuka.", xpReward: 12, coinReward: 15 },
    },
  },
  3: {
    id: 3,
    unitSubtitle: "Bagian 3 • Node 9 - 12",
    unitTitle: "Prinsip 3R (Reduce, Reuse, Recycle)",
    levels: {
      1: { slotNum: 1, nodeId: 9, x: 32.66, y: 43.63, icon: "flag", type: "bacaan", title: "Node 9: Reduce: Kurangi Timbulan Sampah", shortTitle: "Reduce: Kurangi Sampah", desc: "Kebiasaan praktis harian mencegah timbulan sampah dari sumbernya.", xpReward: 15, coinReward: 20 },
      2: { slotNum: 2, nodeId: 10, x: 46.39, y: 57.69, icon: "dumbbell", type: "bacaan", title: "Node 10: Reuse: Guna Ulang Barang", shortTitle: "Reuse: Guna Ulang Barang", desc: "Memaksimalkan masa pakai wadah dan kemasan ramah lingkungan.", xpReward: 15, coinReward: 20 },
      3: { slotNum: 3, nodeId: 11, x: 64.57, y: 68.33, icon: "plus", type: "kuis", title: "Node 11: Kuis Tantangan: Skenario 3R", shortTitle: "Kuis Tantangan Skenario 3R", desc: "Tentukan aksi 3R yang paling tepat pada berbagai skenario.", xpReward: 20, coinReward: 25 },
      4: { slotNum: 4, nodeId: 12, x: 58.46, y: 82.42, icon: "trophy", type: "bacaan", title: "Node 12: Recycle: Daur Ulang & Upcycling", shortTitle: "Recycle: Daur Ulang", desc: "Mengubah sampah menjadi produk baru bernilai guna tinggi.", xpReward: 15, coinReward: 20 },
    },
  },
  4: {
    id: 4,
    unitSubtitle: "Bagian 4 • Node 13 - 16",
    unitTitle: "Pengelolaan Sampah Mandiri & Sekolah",
    levels: {
      1: { slotNum: 1, nodeId: 13, x: 32.66, y: 43.63, icon: "flag", type: "bacaan", title: "Node 13: Pembuatan Kompos Sederhana", shortTitle: "Pembuatan Kompos Sederhana", desc: "Langkah mudah mengolah sampah sisa makanan menjadi pupuk organik.", xpReward: 18, coinReward: 25 },
      2: { slotNum: 2, nodeId: 14, x: 46.39, y: 57.69, icon: "dumbbell", type: "bacaan", title: "Node 14: Bank Sampah & Ekonomi Sirkular", shortTitle: "Bank Sampah & Sirkular", desc: "Menabung sampah terpilah untuk nilai ekonomi dan kelestarian.", xpReward: 18, coinReward: 25 },
      3: { slotNum: 3, nodeId: 15, x: 64.57, y: 68.33, icon: "plus", type: "kuis", title: "Node 15: Kuis Tantangan: Master Pengelolaan", shortTitle: "Kuis Tantangan Master Sampah", desc: "Uji keahlian pengelolaan sampah mandiri dan sekolah.", xpReward: 25, coinReward: 30 },
      4: { slotNum: 4, nodeId: 16, x: 58.46, y: 82.42, icon: "trophy", type: "komitmen", title: "Node 16: Komitmen Pahlawan Lingkungan", shortTitle: "Komitmen Pahlawan", desc: "Tulis aksi nyatamu dan raih gelar Guardian ThinkBin!", xpReward: 30, coinReward: 50 },
    },
  },
};

export default function BelajarPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [currentBagian, setCurrentBagian] = useState<number>(1);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<MapLevel | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      if (user?.id) {
        refreshProfile(user.id).catch(() => {});
        const completed = await fetchUserCompletedNodes(user.id);
        setCompletedNodeIds(completed);
      } else {
        try {
          const raw = localStorage.getItem("thinkbin_completed_nodes");
          if (raw) setCompletedNodeIds(JSON.parse(raw));
        } catch {
          // Fallback
        }
      }
    }
    loadProgress();
  }, [user?.id]);

  // Sequential unlock logic: first uncompleted node from 1 to 16
  let unlockedNodeId = 16;
  for (let i = 1; i <= 16; i++) {
    if (!completedNodeIds.includes(i)) {
      unlockedNodeId = i;
      break;
    }
  }

  const activeBagian = MAP_BAGIANS[currentBagian] || MAP_BAGIANS[1];
  const levels = activeBagian.levels;

  // Find active mascot slot in this bagian
  let activeMascotSlot = 1;
  for (let slot = 1; slot <= 4; slot++) {
    const lvl = levels[slot];
    if (lvl && lvl.nodeId === unlockedNodeId) {
      activeMascotSlot = slot;
      break;
    }
    if (lvl && completedNodeIds.includes(lvl.nodeId)) {
      activeMascotSlot = slot;
    }
  }

  const handleNodeClick = (lvl: MapLevel) => {
    const isLocked = lvl.nodeId > unlockedNodeId;
    if (isLocked) {
      setToastMessage("Selesaikan level sebelumnya terlebih dahulu.");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setSelectedLevel(lvl);
  };

  const handleStartLevel = () => {
    if (!selectedLevel) return;
    if (selectedLevel.type === "kuis") {
      router.push(`/tantangan/${selectedLevel.nodeId}`);
    } else {
      router.push(`/bacaan/${selectedLevel.nodeId}`);
    }
  };

  return (
    <div className="relative w-full h-full min-h-full flex flex-col select-none overflow-hidden bg-[#4da325]">
      
      {/* ── 1. FLOATING OVERLAYS (Z-INDEX 50: ALWAYS ABOVE PATH & MASCOT) ── */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none px-3.5 pt-3.5 flex flex-col gap-2.5">
        
        {/* Floating Top Stat Bar (Enhanced comfortable legible size) */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          {/* Streak Pill */}
          <div className="flex items-center gap-2 bg-white border-[2.5px] border-[#382C22] rounded-full px-3.5 py-1.5 shadow-[0_3px_0_#382C22] backdrop-blur-xs">
            <Image
              src="/assets_game/streak_icon.png"
              alt="Streak"
              width={18}
              height={18}
              className="object-contain"
            />
            <span className="font-fredoka font-bold text-sm text-[#382C22]">
              {user?.streak ?? 1} Hari
            </span>
          </div>

          {/* XP & Coin Pills */}
          <div className="flex items-center gap-2">
            {/* XP Pill */}
            <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] rounded-full px-3.5 py-1.5 shadow-[0_3px_0_#382C22] backdrop-blur-xs">
              <Image
                src="/assets_game/exp_progress.png"
                alt="XP"
                width={16}
                height={16}
                className="object-contain"
              />
              <span className="font-fredoka font-bold text-sm text-[#0284c7]">
                {user?.xp ?? 0} XP
              </span>
            </div>

            {/* Coin Pill */}
            <div className="flex items-center gap-1.5 bg-white border-[2.5px] border-[#382C22] rounded-full px-3.5 py-1.5 shadow-[0_3px_0_#382C22] backdrop-blur-xs">
              <Image
                src="/screens_assets/coin.png"
                alt="Coin"
                width={18}
                height={18}
                className="object-contain"
              />
              <span className="font-fredoka font-bold text-sm text-[#d97706]">
                {user?.coins ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Bagian Info Bar (Comfortable, large legible size) */}
        <div className="relative w-full pointer-events-auto">
          <div className="w-full bg-white border-[3px] border-[#382C22] rounded-[24px] p-2.5 px-3.5 flex items-center shadow-[0_4.5px_0_#382C22] backdrop-blur-xs">
            <div className="w-11 h-11 bg-[#7c4e18] border-[2px] border-[#382C22] rounded-2xl flex items-center justify-center shadow-xs flex-shrink-0 text-white font-fredoka font-extrabold text-lg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </div>

            <div className="ml-3 flex flex-col">
              <span className="text-[11px] font-fredoka font-bold text-[#0284c7] uppercase tracking-wider">
                {activeBagian.unitSubtitle}
              </span>
              <span className="text-[15px] font-fredoka font-black text-[#2b2b2b] leading-tight mt-0.5">
                {activeBagian.unitTitle}
              </span>
            </div>

            {/* Unit Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="ml-auto w-9 h-9 rounded-2xl bg-[#e8f7fe] hover:bg-[#bae6fd] active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform border-[2px] border-[#7dd3fc]"
              aria-label="Pilih Bagian"
            >
              <span className="w-4 h-0.5 bg-[#0284c7] rounded-full" />
              <span className="w-4 h-0.5 bg-[#0284c7] rounded-full" />
              <span className="w-4 h-0.5 bg-[#0284c7] rounded-full" />
            </button>
          </div>

          {/* Dropdown Menu (Z-INDEX 60: STRICTLY COVERS MASCOT AND ALL MAP ELEMENTS) */}
          {showDropdown && (
            <div className="absolute top-16 right-0 w-full max-w-[340px] bg-white border-[3px] border-[#382C22] rounded-[22px] p-2.5 flex flex-col gap-2 shadow-[0_12px_28px_rgba(0,0,0,0.25)] z-[60] animate-in zoom-in-95 duration-150">
              {[1, 2, 3, 4].map((bNum) => (
                <button
                  key={bNum}
                  type="button"
                  onClick={() => {
                    setCurrentBagian(bNum);
                    setShowDropdown(false);
                  }}
                  className={`p-3 rounded-xl font-fredoka font-bold text-xs text-left transition-all ${
                    currentBagian === bNum
                      ? "bg-[#0284c7] text-white shadow-xs"
                      : "bg-[#f8fafc] text-[#334155] hover:bg-[#e0f2fe]"
                  }`}
                >
                  {MAP_BAGIANS[bNum].unitSubtitle}: {MAP_BAGIANS[bNum].unitTitle}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. FULL SCENE MAP BACKGROUND (Starts from the very top, edge-to-edge) ── */}
      <main className="relative flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24 z-0">
        <div className="relative w-full max-w-[440px] mx-auto">
          <div className="relative w-full">
            <Image
              src="/screens_assets/map_bg_current.png"
              alt="ThinkBin Learning Map"
              width={576}
              height={1024}
              className="w-full h-auto object-contain block pointer-events-none select-none"
              priority
            />

            {/* ANIMATED FLOATING CLOUDS */}
            <div className="absolute top-0 left-0 w-full h-[36%] pointer-events-none overflow-hidden z-10">
              <div className="absolute top-[12%] left-2 w-16 h-8 opacity-85 animate-pulse">
                <svg viewBox="0 0 64 36" fill="#ffffff">
                  <path d="M 12 28 A 10 10 0 0 1 20 14 A 14 14 0 0 1 42 12 A 12 12 0 0 1 54 22 A 8 8 0 0 1 52 28 Z" />
                </svg>
              </div>
              <div className="absolute top-[26%] right-6 w-20 h-10 opacity-80">
                <svg viewBox="0 0 64 36" fill="#ffffff">
                  <path d="M 10 28 A 12 12 0 0 1 22 12 A 16 16 0 0 1 46 10 A 14 14 0 0 1 58 22 A 8 8 0 0 1 56 28 Z" />
                </svg>
              </div>
            </div>

            {/* 4 LEVEL NODES POSITIONED ALONG ROAD */}
            {[1, 2, 3, 4].map((slot) => {
              const lvl = levels[slot];
              if (!lvl) return null;

              const isCompleted = completedNodeIds.includes(lvl.nodeId);
              const isCurrent = lvl.nodeId === unlockedNodeId;
              const isLocked = lvl.nodeId > unlockedNodeId;

              return (
                <button
                  key={lvl.nodeId}
                  type="button"
                  onClick={() => handleNodeClick(lvl)}
                  style={{ left: `${lvl.x}%`, top: `${lvl.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-[15%] max-w-[66px] min-w-[48px] aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all z-10 active:scale-90 ${
                    isCompleted
                      ? "bg-gradient-to-b from-[#85e000] to-[#6ab800] border-[3.5px] border-white shadow-[0_6px_0_#4a8500,0_6px_14px_rgba(0,0,0,0.2)]"
                      : isCurrent
                      ? "bg-gradient-to-b from-[#ffc738] to-[#e59210] border-[3.5px] border-white shadow-[0_6px_0_#b36a00,0_8px_18px_rgba(229,146,16,0.5)] animate-pulse"
                      : "bg-[#646464]/90 border-[3.5px] border-white/60 shadow-[0_5px_0_#3a3a3a,0_4px_10px_rgba(0,0,0,0.3)] grayscale opacity-85"
                  }`}
                >
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="relative w-7 h-7 flex items-center justify-center">
                      <Image
                        src="/screens_assets/learn.png"
                        alt="Current Node"
                        width={28}
                        height={28}
                        className="object-contain drop-shadow-sm"
                      />
                    </div>
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* MASCOT STANDING ABOVE CURRENT NODE (Z-INDEX 15: UNDER THE Z-50 DROPDOWN MENU) */}
            {levels[activeMascotSlot] && (
              <div
                style={{
                  left: `${levels[activeMascotSlot].x}%`,
                  top: `${levels[activeMascotSlot].y - 8}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none z-15 animate-bounce"
                style-prop={{ animationDuration: "2.5s" }}
              >
                <Image
                  src="/assets/mascot_leonardo.png"
                  alt="Mascot Position"
                  width={64}
                  height={64}
                  className="object-contain drop-shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* TOAST PILL FOR LOCKED NODES */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white border border-[#334155] rounded-full px-4 py-2 text-xs font-fredoka font-bold shadow-xl z-50 animate-in fade-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* LEVEL ACTION DRAWER MODAL */}
      {selectedLevel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full text-center border-[4px] border-[#E5E5E5] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="inline-block bg-[#E8F7FE] text-[#1CB0F6] border border-[#BAE6FD] px-3 py-0.5 rounded-full font-fredoka font-bold text-xs mb-3">
              {selectedLevel.shortTitle}
            </div>

            <h3 className="font-fredoka font-extrabold text-base text-[#382C22] mb-1.5 leading-snug">
              {selectedLevel.title}
            </h3>

            <p className="font-nunito font-semibold text-xs text-[#796F65] leading-relaxed mb-4">
              {selectedLevel.desc}
            </p>

            {/* Rewards Pill */}
            {completedNodeIds.includes(selectedLevel.nodeId) ? (
              <div className="flex items-center justify-center gap-2 bg-[#ecfccb] border-[2px] border-[#65a30d] rounded-xl p-2 mb-4">
                <span className="font-fredoka font-black text-xs text-[#3f6212]">
                  Sudah Selesai (Latihan Ulang: +0 XP, +0 Koin)
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 bg-[#FDE8A5] border-[2px] border-[#D39A1C] rounded-xl p-2 mb-4">
                <div className="flex items-center gap-1.5 font-fredoka font-bold text-xs text-[#1CB0F6]">
                  <Image
                    src="/assets_game/exp_progress.png"
                    alt="XP Daun Petir"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                  <span>+{selectedLevel.xpReward} XP</span>
                </div>
                <span className="text-[#D39A1C]">•</span>
                <div className="flex items-center gap-1.5 font-fredoka font-bold text-xs text-[#F57F17]">
                  <Image
                    src="/assets_game/coin.png"
                    alt="Koin Daun Kuning"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                  <span>+{selectedLevel.coinReward} Koin</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartLevel}
                className="w-full py-3.5 bg-[#58CC02] hover:bg-[#4CAF00] text-white font-fredoka font-extrabold text-base rounded-2xl shadow-[0_5px_0_#4CAF00] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wide"
              >
                {completedNodeIds.includes(selectedLevel.nodeId)
                  ? selectedLevel.type === "kuis"
                    ? "Ulangi Kuis Tantangan"
                    : selectedLevel.type === "komitmen"
                    ? "Baca Komitmen Hijau"
                    : "Baca Ulang Materi"
                  : selectedLevel.type === "kuis"
                  ? "Mulai Kuis Tantangan"
                  : selectedLevel.type === "komitmen"
                  ? "Tulis Komitmen Hijau"
                  : "Mulai Bacaan"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedLevel(null)}
                className="w-full py-2 text-[#796F65] font-fredoka font-bold text-xs hover:text-[#382C22] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
