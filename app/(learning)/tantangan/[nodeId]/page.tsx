'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MODUL_DATA } from '@/lib/modul-data';
import { useAuth } from '@/lib/auth-context';
import { recordNodeCompletion } from '@/lib/supabase';

interface GameItem {
  id: string;
  name: string;
  category: string; // Correct bin / category name
}

export default function TantanganPage() {
  const router = useRouter();
  const params = useParams();
  const nodeId = parseInt(params.nodeId as string, 10);
  const { user, updateUser } = useAuth();

  const node = MODUL_DATA.find(n => n.id === nodeId);

  // Game configuration
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentItemIdx, setCurrentItemIdx] = useState<number>(0);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [bins, setBins] = useState<string[]>([]);
  const [hasUnlocked, setHasUnlocked] = useState<boolean>(false);

  // Define game data based on the node
  useEffect(() => {
    if (!node) {
      router.push('/belajar');
      return;
    }

    let items: GameItem[] = [];
    let categories: string[] = [];

    if (nodeId === 4) {
      // Pilah Organik vs Anorganik
      categories = ['Organik', 'Anorganik'];
      items = [
        { id: '1', name: 'Kulit Pisang 🍌', category: 'Organik' },
        { id: '2', name: 'Botol Aqua 🧴', category: 'Anorganik' },
        { id: '3', name: 'Sisa Nasi 🍚', category: 'Organik' },
        { id: '4', name: 'Kantong Plastik 🛍️', category: 'Anorganik' },
        { id: '5', name: 'Daun Kering 🍂', category: 'Organik' },
        { id: '6', name: 'Kaleng Soda 🥫', category: 'Anorganik' },
        { id: '7', name: 'Sisa Apel 🍎', category: 'Organik' },
        { id: '8', name: 'Sedotan Plastik 🥤', category: 'Anorganik' }
      ];
    } else if (nodeId === 6) {
      // Tantangan Dampak Sampah
      categories = ['Tanah & Air', 'Udara'];
      items = [
        { id: '1', name: 'Cairan Lindi (Leachate) 💧', category: 'Tanah & Air' },
        { id: '2', name: 'Gas Metana (Metana) 💨', category: 'Udara' },
        { id: '3', name: 'Mikroplastik Renik 🔬', category: 'Tanah & Air' },
        { id: '4', name: 'Karbon Dioksida (CO2) 🌫️', category: 'Udara' },
        { id: '5', name: 'Pencemaran Sumur Warga 🚰', category: 'Tanah & Air' },
        { id: '6', name: 'Asap Pembakaran Plastik 🔥', category: 'Udara' }
      ];
    } else if (nodeId === 10) {
      // Tantangan Praktik 3R
      categories = ['Reduce', 'Reuse', 'Recycle'];
      items = [
        { id: '1', name: 'Bawa Tumbler Sendiri 🥛', category: 'Reduce' },
        { id: '2', name: 'Toples Bekas jadi Pot 🪴', category: 'Reuse' },
        { id: '3', name: 'Botol dilebur jadi Serat Benang 👕', category: 'Recycle' },
        { id: '4', name: 'Menolak Sedotan Plastik 🚫', category: 'Reduce' },
        { id: '5', name: 'Kotak Sepatu untuk Wadah Buku 📦', category: 'Reuse' },
        { id: '6', name: 'Kertas Ujian dilebur jadi Bubur Kertas 📄', category: 'Recycle' }
      ];
    } else if (nodeId === 12) {
      // Pemilahan Sumber
      categories = ['Basah', 'Kering', 'Anorganik'];
      items = [
        { id: '1', name: 'Sisa Sayuran Kantin 🥦', category: 'Basah' },
        { id: '2', name: 'Guguran Daun Pohon 🍂', category: 'Kering' },
        { id: '3', name: 'Wadah Gelas Plastik 🥤', category: 'Anorganik' },
        { id: '4', name: 'Tulang Ayam Bekas 🍗', category: 'Basah' },
        { id: '5', name: 'Ranting Kayu Kering 🪵', category: 'Kering' },
        { id: '6', name: 'Kaleng Logam Aluminium 🥫', category: 'Anorganik' }
      ];
    } else {
      // Fallback
      categories = ['Organik', 'Anorganik'];
      items = [
        { id: '1', name: 'Kulit Apel 🍎', category: 'Organik' },
        { id: '2', name: 'Kotak Susu 🥛', category: 'Anorganik' }
      ];
    }

    // Shuffle items
    setGameItems(items.sort(() => Math.random() - 0.5));
    setBins(categories);
  }, [nodeId, node, router]);

  // Game timer countdown effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (timeLeft <= 0) {
      handleGameOver();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver]);

  const handleStartGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
    setScore(0);
    setCurrentItemIdx(0);
    setGameOver(false);
  };

  const handleGameOver = async () => {
    setGameOver(true);
    
    // Check if player scored at least 3 correct to pass
    const isPassing = score >= 3 || score === gameItems.length;
    if (isPassing && !hasUnlocked) {
      setHasUnlocked(true);
      
      const xpReward = node?.xpReward || 12;
      const coinsReward = (node?.coinReward || 15) + 10;

      // 1. Record node completion in Supabase & Local
      await recordNodeCompletion({
        userId: user?.id || 'usr_guest',
        nodeId,
        xpEarned: xpReward,
        coinsEarned: coinsReward,
        isCorrect: true,
      });

      // 2. Update reactive state in AuthContext
      const currentXp = user?.xp || 0;
      const currentCoins = user?.coins || 0;
      updateUser({
        xp: currentXp + xpReward,
        coins: currentCoins + coinsReward,
      });
    }
  };

  const handleChoice = (selectedBin: string) => {
    const currentItem = gameItems[currentItemIdx];
    let newScore = score;

    if (currentItem.category === selectedBin) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentItemIdx + 1 >= gameItems.length) {
      setScore(newScore);
      handleGameOver();
    } else {
      setCurrentItemIdx(currentItemIdx + 1);
    }
  };

  const currentItem = gameItems[currentItemIdx];
  const isPassing = score >= 3 || score === gameItems.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4">
      
      {/* Top statistics Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={() => router.push('/belajar')}
          className="text-slate-400 hover:text-white font-extrabold text-sm"
        >
          ✕ Keluar
        </button>
        <span className="text-xs font-black text-amber-500 uppercase tracking-widest animate-pulse">
          🎯 Mini-Game Checkpoint
        </span>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-xs font-black text-red-400">
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center items-center py-6">
        {!gameStarted ? (
          <div className="bg-slate-800 rounded-2xl border-2 border-amber-500 p-6 text-center shadow-xl w-full animate-scaleUp">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-lg font-black text-amber-400 mb-2">
              {node?.title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {node?.konsepInti} <br/>
              <span className="text-emerald-400 font-extrabold mt-2 block">
                Target: Minimal 3 jawaban benar dalam 30 detik!
              </span>
            </p>
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 border-b-4 border-orange-700 text-slate-900 font-black text-sm py-4 rounded-xl hover:brightness-105 active:border-b-0 active:translate-y-1 transition-all"
            >
              Mulai Bermain! 🚀
            </button>
          </div>
        ) : gameOver ? (
          <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-6 text-center shadow-xl w-full animate-scaleUp">
            <div className="text-5xl mb-4">{isPassing ? '🏆' : '😢'}</div>
            <h2 className="text-lg font-black mb-2">
              {isPassing ? 'Tantangan Berhasil!' : 'Mencoba Sekali Lagi?'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Kamu berhasil menjawab <strong className="text-amber-400 text-sm font-black">{score} / {gameItems.length}</strong> sampah secara benar!
              {isPassing && (
                <span className="text-emerald-400 font-extrabold mt-2 block">
                  🎁 +{node?.xpReward || 12} XP / +{(node?.coinReward || 15) + 10} Koin (Termasuk bonus tantangan!)
                </span>
              )}
            </p>

            <div className="flex flex-col gap-3">
              {isPassing ? (
                <button
                  onClick={() => router.push('/belajar')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-3 px-4 rounded-xl active:translate-y-0.5 transition-all"
                >
                  Selesai & Lanjut Belajar 🎉
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStartGame}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-3 px-4 rounded-xl active:translate-y-0.5 transition-all"
                  >
                    Main Lagi 🔁
                  </button>
                  <button
                    onClick={() => router.push('/belajar')}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-black text-xs py-2 px-4 rounded-xl transition-all"
                  >
                    Nanti Saja
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Score & Progress indicator */}
            <div className="w-full bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-400">Kemajuan: {currentItemIdx + 1} / {gameItems.length}</span>
              <span className="text-xs font-black text-emerald-400">Skor Benar: {score}</span>
            </div>

            {/* Falling/Floating Item Box */}
            <div className="w-full h-40 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center p-4 relative mb-12 animate-float">
              {currentItem && (
                <div className="text-xl font-extrabold text-white bg-slate-800 px-6 py-4 rounded-xl border border-slate-600 shadow-lg text-center animate-pulse">
                  {currentItem.name}
                </div>
              )}
            </div>

            {/* Drag bins selector buttons */}
            <div className={`grid gap-4 w-full ${bins.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {bins.map((bin) => {
                let binColor = 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200';
                if (bin === 'Organik' || bin === 'Basah') binColor = 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white';
                if (bin === 'Anorganik') binColor = 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white';
                if (bin === 'Kering') binColor = 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-white';
                if (bin === 'Reduce') binColor = 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white';
                if (bin === 'Reuse') binColor = 'bg-violet-600 hover:bg-violet-500 border-violet-500 text-white';
                if (bin === 'Recycle') binColor = 'bg-teal-600 hover:bg-teal-500 border-teal-500 text-white';

                return (
                  <button
                    key={bin}
                    onClick={() => handleChoice(bin)}
                    className={`p-4 rounded-xl border-2 border-b-8 font-black text-xs text-center transition-all active:border-b-2 active:translate-y-1.5 ${binColor}`}
                  >
                    🗑️ {bin}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Decorative footer */}
      <div className="w-full max-w-md mx-auto text-center text-[10px] text-slate-600 font-semibold py-2">
        Game Ref: SMPN 20 Malang OPSI 2026. ThinkBin Project.
      </div>

    </div>
  );
}
