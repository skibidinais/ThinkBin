"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MODUL_DATA,
  BAGIAN_INFO,
  ModulNode,
  getRankTier,
} from "@/lib/modul-data";
import { useAuth } from "@/lib/auth-context";
import { fetchUserCompletedNodes } from "@/lib/supabase";

export default function BelajarPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentBagian, setCurrentBagian] = useState<number>(1);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [selectedNode, setSelectedNode] = useState<ModulNode | null>(null);
  const [currentXp, setCurrentXp] = useState<number>(0);

  useEffect(() => {
    async function loadProgress() {
      if (user?.id) {
        const nodes = await fetchUserCompletedNodes(user.id);
        setCompletedNodeIds(nodes);
      } else {
        try {
          const savedCompleted = localStorage.getItem("thinkbin_completed_nodes");
          if (savedCompleted) {
            setCompletedNodeIds(JSON.parse(savedCompleted));
          }
        } catch {
          setCompletedNodeIds([]);
        }
      }
      setCurrentXp(user?.xp || 0);
    }
    loadProgress();
  }, [user]);

  // Determine unlocked node ID: completed max + 1
  const maxCompleted = completedNodeIds.length > 0 ? Math.max(...completedNodeIds) : 0;
  const unlockedNodeId = Math.min(maxCompleted + 1, 16);

  const activeBagianInfo = BAGIAN_INFO.find((b) => b.id === currentBagian) || BAGIAN_INFO[0];
  const filteredNodes = MODUL_DATA.filter((n) => n.bagianId === currentBagian);
  const rankTier = getRankTier(currentXp);

  const handleNodeClick = (node: ModulNode) => {
    if (node.id > unlockedNodeId) return; // Locked
    setSelectedNode(node);
  };

  const handleStartNode = () => {
    if (!selectedNode) return;
    if (selectedNode.type === "kuis") {
      router.push(`/tantangan/${selectedNode.id}`);
    } else {
      router.push(`/bacaan/${selectedNode.id}`);
    }
  };

  return (
    <div className="relative flex flex-col min-h-full pb-10 select-none">
      {/* STICKY TOP LEVEL / UNIT INFO BAR */}
      <div className="sticky top-0 left-0 right-0 z-30 px-4 pt-3 pb-2 bg-gradient-to-b from-[#50a5eb]/80 via-[#50a5eb]/40 to-transparent pointer-events-auto">
        <div className="w-full bg-white border-[3.5px] border-[#e5e5e5] border-b-[6.5px] rounded-[22px] p-2.5 px-3.5 flex items-center shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
          <div className="w-10 h-10 bg-[#7c4e18] rounded-full flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.15)] flex-shrink-0 text-white font-fredoka font-extrabold text-sm">
            🗺️
          </div>
          <div className="ml-3 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-fredoka font-bold text-[#1cb0f6] uppercase tracking-wider">
                BAGIAN {currentBagian} DARI 4
              </span>
              <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold border ${rankTier.color}`}>
                {rankTier.name}
              </span>
            </div>
            <span className="text-sm font-fredoka font-extrabold text-[#2b2b2b] leading-tight">
              {activeBagianInfo.title}
            </span>
          </div>

          {/* Unit Switcher Buttons */}
          <div className="ml-auto flex items-center gap-1">
            {BAGIAN_INFO.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setCurrentBagian(b.id)}
                className={`w-7 h-7 rounded-full font-fredoka font-extrabold text-xs transition-all cursor-pointer ${
                  currentBagian === b.id
                    ? "bg-[#1cb0f6] text-white shadow-sm scale-105"
                    : "bg-[#e8f7fe] text-[#1cb0f6] hover:bg-[#bae6fd]"
                }`}
              >
                {b.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* S-CURVE NODES MAP CONTAINER */}
      <div className="flex flex-col items-center gap-8 px-6 py-6 w-full max-w-[380px] mx-auto">
        {filteredNodes.map((node, index) => {
          const isCompleted = completedNodeIds.includes(node.id);
          const isCurrent = node.id === unlockedNodeId;
          const isLocked = node.id > unlockedNodeId;

          // S-Curve horizontal offset pattern (-28px, 0px, 28px, 0px)
          const offsets = ["-translate-x-7", "translate-x-0", "translate-x-7", "translate-x-0"];
          const offsetClass = offsets[index % 4];

          return (
            <div
              key={node.id}
              className={`relative flex flex-col items-center ${offsetClass}`}
            >
              {/* Floating Node Label */}
              <div className="mb-2 bg-white/95 border border-[#E5E5E5] px-2.5 py-0.5 rounded-full shadow-xs">
                <span className="font-fredoka font-bold text-[10px] text-[#382C22] line-clamp-1 max-w-[150px]">
                  {node.title}
                </span>
              </div>

              {/* Node Circle Button */}
              <button
                type="button"
                onClick={() => handleNodeClick(node)}
                disabled={isLocked}
                className={`relative w-18 h-18 rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                  isCompleted
                    ? "bg-[#58cc02] border-[4.5px] border-[#4caf00] border-b-[8px] text-white shadow-lg active:translate-y-1"
                    : isCurrent
                    ? "bg-[#ffc800] border-[4.5px] border-[#d39a1c] border-b-[8px] text-white shadow-[0_0_20px_rgba(255,200,0,0.6)] animate-pulse active:translate-y-1"
                    : "bg-[#e5e5e5] border-[4px] border-[#cccccc] border-b-[6px] text-gray-400 cursor-not-allowed opacity-75"
                }`}
              >
                {isCompleted ? (
                  <span className="text-2xl font-extrabold drop-shadow-md">✓</span>
                ) : isCurrent ? (
                  <div className="relative w-9 h-9 flex items-center justify-center">
                    <Image
                      src="/screens_assets/learn.png"
                      alt="Current Node"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xl opacity-60">🔒</span>
                )}

                {/* Node Number Badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#E5E5E5] text-[#382C22] font-fredoka font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                  {node.id}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* NODE POPUP DRAWER MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full text-center border-[4px] border-[#E5E5E5] shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header Badge */}
            <div className="inline-block bg-[#E8F7FE] text-[#1CB0F6] border border-[#BAE6FD] px-3 py-0.5 rounded-full font-fredoka font-bold text-xs mb-3">
              Node {selectedNode.id} • {selectedNode.bagianTitle}
            </div>

            <h3 className="font-fredoka font-extrabold text-lg text-[#382C22] mb-2 leading-snug">
              {selectedNode.title}
            </h3>

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
                <span>+{selectedNode.xpReward} XP</span>
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
                <span>+{selectedNode.coinReward} Koin</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartNode}
                className="w-full py-3.5 bg-[#58CC02] hover:bg-[#4CAF00] text-white font-fredoka font-extrabold text-base rounded-2xl shadow-[0_5px_0_#4CAF00] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                {selectedNode.type === "kuis"
                  ? "🎮 Mulai Tantangan!"
                  : selectedNode.type === "komitmen"
                  ? "✍️ Tulis Komitmen Hijau"
                  : "📖 Mulai Bacaan"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
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
