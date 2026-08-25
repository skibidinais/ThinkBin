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

const MAP_POSITIONS = [
  { slotNum: 1, x: 32.66, y: 43.63, icon: "flag" as const },
  { slotNum: 2, x: 46.39, y: 57.69, icon: "dumbbell" as const },
  { slotNum: 3, x: 64.57, y: 68.33, icon: "plus" as const },
  { slotNum: 4, x: 58.46, y: 82.42, icon: "trophy" as const },
];

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
    unitTitle: "Solusi & Praktik Pengelolaan",
    levels: {
      1: { slotNum: 1, nodeId: 9, x: 32.66, y: 43.63, icon: "flag", type: "bacaan", title: "Node 9: Prinsip 3R: Reduce, Reuse, Recycle", shortTitle: "Prinsip 3R Terpadu", desc: "Hierarki pengelolaan sampah berkelanjutan.", xpReward: 12, coinReward: 15 },
      2: { slotNum: 2, nodeId: 10, x: 46.39, y: 57.69, icon: "dumbbell", type: "kuis", title: "Node 10: Kuis Tantangan: Klasifikasi Praktik 3R", shortTitle: "Kuis Tantangan Praktik 3R", desc: "Kelompokkan aksi nyata ke dalam Reduce, Reuse, Recycle.", xpReward: 20, coinReward: 25 },
      3: { slotNum: 3, nodeId: 11, x: 64.57, y: 68.33, icon: "plus", type: "bacaan", title: "Node 11: Sistem Bank Sampah Sekolah", shortTitle: "Sistem Bank Sampah Sekolah", desc: "Cara menabung sampah terpilah menjadi tabungan bernilai.", xpReward: 12, coinReward: 15 },
      4: { slotNum: 4, nodeId: 12, x: 58.46, y: 82.42, icon: "trophy", type: "kuis", title: "Node 12: Kuis Tantangan: Pilah dari Sumbernya", shortTitle: "Kuis Pilah dari Sumber", desc: "Pisahkan sampah basah kantin vs ranting kering vs botol.", xpReward: 20, coinReward: 25 },
    },
  },
  4: {
    id: 4,
    unitSubtitle: "Bagian 4 • Node 13 - 16",
    unitTitle: "Gaya Hidup Hijau & Komitmen",
    levels: {
      1: { slotNum: 1, nodeId: 13, x: 32.66, y: 43.63, icon: "flag", type: "bacaan", title: "Node 13: Zero Waste Lifestyle di Sekolah", shortTitle: "Zero Waste di Sekolah", desc: "Membawa tumbler, tepak makan, dan tas belanja kain.", xpReward: 12, coinReward: 15 },
      2: { slotNum: 2, nodeId: 14, x: 46.39, y: 57.69, icon: "dumbbell", type: "bacaan", title: "Node 14: Pembuatan Pupuk Kompos Organik", shortTitle: "Pembuatan Pupuk Kompos", desc: "Mengolah daun kering dan sisa buah menjadi pupuk subur.", xpReward: 12, coinReward: 15 },
      3: { slotNum: 3, nodeId: 15, x: 64.57, y: 68.33, icon: "plus", type: "bacaan", title: "Node 15: ThinkBin Tri-Action Framework", shortTitle: "Tri-Action Framework", desc: "Membangun Pengetahuan, Kemauan, dan Kemampuan konsisten.", xpReward: 12, coinReward: 15 },
      4: { slotNum: 4, nodeId: 16, x: 58.46, y: 82.42, icon: "leaf", type: "komitmen", title: "Node 16: Ikrar & Komitmen Hijau Siswa", shortTitle: "Ikrar & Komitmen Hijau", desc: "Tulis ikrar aksimu untuk lingkungan sekolah SMPN 20 Malang!", xpReward: 30, coinReward: 40 },
    },
  },
};

export default function BelajarPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentBagian, setCurrentBagian] = useState<number>(1);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<MapLevel | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadNodes() {
      if (user?.id) {
        const completed = await fetchUserCompletedNodes(user.id);
        setCompletedNodeIds(completed);
      } else {
        try {
          const raw = localStorage.getItem("thinkbin_completed_nodes");
          if (raw) setCompletedNodeIds(JSON.parse(raw));
        } catch {
          // fallback
        }
      }
    }
    loadNodes();
  }, [user]);

  const maxCompleted = completedNodeIds.length > 0 ? Math.max(...completedNodeIds) : 0;
  const unlockedNodeId = Math.min(maxCompleted + 1, 16);

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
      setToastMessage("Selesaikan level sebelumnya terlebih dahulu 🔒");
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
    <div className="relative w-full h-full flex flex-col select-none bg-[#4da325]">
      {/* FIXED TOP LEVEL / UNIT INFO BAR */}
      <header className="sticky top-0 left-0 right-0 z-40 px-4 pt-3 pb-2 bg-gradient-to-b from-[#50a5eb]/80 via-[#50a5eb]/40 to-transparent pointer-events-auto">
        <div className="w-full bg-white border-[3.5px] border-[#e5e5e5] border-b-[6.5px] rounded-[22px] p-2.5 px-3.5 flex items-center shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
          <div className="w-10 h-10 bg-[#7c4e18] rounded-full flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.15)] flex-shrink-0 text-white font-fredoka font-extrabold text-sm">
            🗺️
          </div>

          <div className="ml-3 flex flex-col">
            <span className="text-[11px] font-fredoka font-bold text-[#1cb0f6] uppercase tracking-wider">
              {activeBagian.unitSubtitle}
            </span>
            <span className="text-sm font-fredoka font-extrabold text-[#2b2b2b] leading-tight">
              {activeBagian.unitTitle}
            </span>
          </div>

          {/* Unit Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="ml-auto w-9 h-9 rounded-full bg-[#e8f7fe] hover:bg-[#bae6fd] active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform"
            aria-label="Pilih Bagian"
          >
            <span className="w-4 h-0.5 bg-[#1cb0f6] rounded-full" />
            <span className="w-4 h-0.5 bg-[#1cb0f6] rounded-full" />
            <span className="w-4 h-0.5 bg-[#1cb0f6] rounded-full" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-18 right-4 w-64 bg-white border-[3px] border-[#e2e8f0] border-b-[6px] rounded-2xl p-2 flex flex-col gap-1.5 shadow-2xl z-50 animate-in zoom-in-95 duration-150">
            {[1, 2, 3, 4].map((bNum) => (
              <button
                key={bNum}
                type="button"
                onClick={() => {
                  setCurrentBagian(bNum);
                  setShowDropdown(false);
                }}
                className={`p-2.5 rounded-xl font-fredoka font-bold text-xs text-left transition-all ${
                  currentBagian === bNum
                    ? "bg-[#0284c7] text-white"
                    : "bg-[#f8fafc] text-[#334155] hover:bg-[#e0f2fe]"
                }`}
              >
                {MAP_BAGIANS[bNum].unitSubtitle}: {MAP_BAGIANS[bNum].unitTitle}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* SCROLLABLE SCENE WITH ORIGINAL MAP BACKGROUND */}
      <main className="relative flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="relative w-full max-w-[440px] mx-auto line-none">
          {/* EXACT SCENE MAP BACKGROUND (High-res 576x1024) */}
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
              <div className="absolute top-[8%] left-0 w-16 h-8 opacity-85 animate-pulse">
                <svg viewBox="0 0 64 36" fill="#ffffff">
                  <path d="M 12 28 A 10 10 0 0 1 20 14 A 14 14 0 0 1 42 12 A 12 12 0 0 1 54 22 A 8 8 0 0 1 52 28 Z" />
                </svg>
              </div>
              <div className="absolute top-[22%] right-6 w-20 h-10 opacity-80">
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
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-[15%] max-w-[66px] min-w-[48px] aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all z-20 active:scale-90 ${
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

            {/* MASCOT STANDING ABOVE CURRENT NODE */}
            {levels[activeMascotSlot] && (
              <div
                style={{
                  left: `${levels[activeMascotSlot].x}%`,
                  top: `${levels[activeMascotSlot].y - 8}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none z-30 animate-bounce"
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

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartLevel}
                className="w-full py-3.5 bg-[#58CC02] hover:bg-[#4CAF00] text-white font-fredoka font-extrabold text-base rounded-2xl shadow-[0_5px_0_#4CAF00] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wide"
              >
                {selectedLevel.type === "kuis"
                  ? "🎮 Mulai Kuis Tantangan"
                  : selectedLevel.type === "komitmen"
                  ? "✍️ Tulis Komitmen Hijau"
                  : "📖 Mulai Bacaan"}
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
