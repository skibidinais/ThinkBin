'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MODUL_DATA } from '@/lib/modul-data';
import { useAuth } from '@/lib/auth-context';
import { recordNodeCompletion, fetchUserCompletedNodes } from '@/lib/supabase';

interface GameItem {
  id: string;
  name: string;
  category: string; // Correct bin / category name
}

export default function TantanganPage() {
  const router = useRouter();
  const params = useParams();
  const nodeId = parseInt(params.nodeId as string, 10);
  const { user, updateUser, refreshProfile } = useAuth();

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
  const [isRepeatAttempt, setIsRepeatAttempt] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);

  // Check if node is already completed on mount
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("thinkbin_completed_nodes");
        const completed: number[] = raw ? JSON.parse(raw) : [];
        if (completed.includes(nodeId)) {
          setIsRepeatAttempt(true);
        }
      } catch {}
    }
    if (user?.id) {
      fetchUserCompletedNodes(user.id).then((nodes) => {
        if (isMounted && nodes.includes(nodeId)) {
          setIsRepeatAttempt(true);
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [nodeId, user?.id]);

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
        { id: '1', name: 'Kulit Pisang', category: 'Organik' },
        { id: '2', name: 'Botol Plastik', category: 'Anorganik' },
        { id: '3', name: 'Sisa Nasi', category: 'Organik' },
        { id: '4', name: 'Kantong Plastik', category: 'Anorganik' },
        { id: '5', name: 'Daun Kering', category: 'Organik' },
        { id: '6', name: 'Kaleng Minuman', category: 'Anorganik' },
        { id: '7', name: 'Sisa Apel', category: 'Organik' },
        { id: '8', name: 'Sedotan Plastik', category: 'Anorganik' }
      ];
    } else if (nodeId === 6) {
      // Tantangan Dampak Sampah
      categories = ['Tanah & Air', 'Udara'];
      items = [
        { id: '1', name: 'Air Lindi', category: 'Tanah & Air' },
        { id: '2', name: 'Gas Metana', category: 'Udara' },
        { id: '3', name: 'Pecahan Kaca', category: 'Tanah & Air' },
        { id: '4', name: 'Asap Dioksin', category: 'Udara' },
        { id: '5', name: 'Mikroplastik', category: 'Tanah & Air' },
        { id: '6', name: 'Gas H2S Busuk', category: 'Udara' }
      ];
    } else if (nodeId === 10 || nodeId === 11) {
      // Praktik 3R
      categories = ['Reduce', 'Reuse', 'Recycle'];
      items = [
        { id: '1', name: 'Bawa Tumbler Sendiri', category: 'Reduce' },
        { id: '2', name: 'Kaleng Jadi Pot Bunga', category: 'Reuse' },
        { id: '3', name: 'Peleburan Botol di Pabrik', category: 'Recycle' },
        { id: '4', name: 'Tolak Kantong Kresek', category: 'Reduce' },
        { id: '5', name: 'Baju Bekas Jadi Kain Lap', category: 'Reuse' },
        { id: '6', name: 'Kardus Dicacah Jadi Kertas Baru', category: 'Recycle' }
      ];
    } else if (nodeId === 12 || nodeId === 15) {
      // Pemilahan Sumber 3 Tong
      categories = ['Organik Basah', 'Organik Kering', 'Anorganik'];
      items = [
        { id: '1', name: 'Sisa Kuah Sayur', category: 'Organik Basah' },
        { id: '2', name: 'Ranting & Daun Kering', category: 'Organik Kering' },
        { id: '3', name: 'Gelas Plastik Bersih', category: 'Anorganik' },
        { id: '4', name: 'Kulit Semangka', category: 'Organik Basah' },
        { id: '5', name: 'Kertas HVS Bekas', category: 'Organik Kering' },
        { id: '6', name: 'Kaleng Minuman', category: 'Anorganik' }
      ];
    } else if (nodeId === 20) {
      // Daur Ulang Kreatif (Kompos vs Upcycling vs Pakan Maggot)
      categories = ['Kompos / Enzim', 'Ecobrick / Upcycle', 'Pakan Maggot'];
      items = [
        { id: '1', name: 'Kulit Jeruk & Apel', category: 'Kompos / Enzim' },
        { id: '2', name: 'Plastik Sachet Kering', category: 'Ecobrick / Upcycle' },
        { id: '3', name: 'Sisa Nasi & Daging Kantin', category: 'Pakan Maggot' },
        { id: '4', name: 'Sisa Sayur Mentah', category: 'Kompos / Enzim' },
        { id: '5', name: 'Kresek Bersih', category: 'Ecobrick / Upcycle' },
        { id: '6', name: 'Sisa Lauk Berlemak', category: 'Pakan Maggot' }
      ];
    } else if (nodeId === 24) {
      // Aksi Sekolah Adiwiyata (Ramah Lingkungan vs Tidak Ramah)
      categories = ['Aksi Adiwiyata', 'Bukan Adiwiyata'];
      items = [
        { id: '1', name: 'Bawa Misting & Tumbler', category: 'Aksi Adiwiyata' },
        { id: '2', name: 'Beli Kemasan Sachet Sekali Pakai', category: 'Bukan Adiwiyata' },
        { id: '3', name: 'Ikut Piket Timbang Sampah Kelas', category: 'Aksi Adiwiyata' },
        { id: '4', name: 'Menaruh Sampah di Kolong Meja', category: 'Bukan Adiwiyata' },
        { id: '5', name: 'Lepas Label & Cuci Botol PET', category: 'Aksi Adiwiyata' },
        { id: '6', name: 'Mencampur Sisa Soto ke Tong Kertas', category: 'Bukan Adiwiyata' }
      ];
    } else if (nodeId === 28) {
      // Aksi Komunitas & Zero Waste
      categories = ['Ekonomi Sirkular', 'Ekonomi Linier'];
      items = [
        { id: '1', name: 'Daur Ulang Botol PET Jadi Serat Baju', category: 'Ekonomi Sirkular' },
        { id: '2', name: 'Beli Barang Lalu Langsung Dibuang ke TPA', category: 'Ekonomi Linier' },
        { id: '3', name: 'Refill Sabun Pakai Wadah Lama', category: 'Ekonomi Sirkular' },
        { id: '4', name: 'Menggunakan Sedotan Plastik Sekali Buang', category: 'Ekonomi Linier' },
        { id: '5', name: 'Menabung Sampah ke Bank Sampah', category: 'Ekonomi Sirkular' },
        { id: '6', name: 'Membakar Sampah Plastik di Pekarangan', category: 'Ekonomi Linier' }
      ];
    } else if (nodeId === 32) {
      // Identifikasi Sampah B3 vs Anorganik Biasa
      categories = ['Drop-Box B3', 'Tong Anorganik Biasa'];
      items = [
        { id: '1', name: 'Baterai Jam Dinding Bocor', category: 'Drop-Box B3' },
        { id: '2', name: 'Botol Kaca Minuman Sirup', category: 'Tong Anorganik Biasa' },
        { id: '3', name: 'Lampu Neon Panjang Pecah', category: 'Drop-Box B3' },
        { id: '4', name: 'Kaleng Biskuit Logam', category: 'Tong Anorganik Biasa' },
        { id: '5', name: 'Earphone & Kabel Putus', category: 'Drop-Box B3' },
        { id: '6', name: 'Kardus Box Paket Bersih', category: 'Tong Anorganik Biasa' }
      ];
    } else if (nodeId === 36) {
      // Aksi Rendah Karbon
      categories = ['Hemat Energi & Rendah Karbon', 'Boros Emisi'];
      items = [
        { id: '1', name: 'Matikan AC & Lampu Saat Ruang Kosong', category: 'Hemat Energi & Rendah Karbon' },
        { id: '2', name: 'Biarkan Kran Air Wastafel Terbuka', category: 'Boros Emisi' },
        { id: '3', name: 'Habiskan Makanan Tanpa Sisa', category: 'Hemat Energi & Rendah Karbon' },
        { id: '4', name: 'Membuang Separuh Nasi Kotak', category: 'Boros Emisi' },
        { id: '5', name: 'Bersepeda / Jalan Kaki ke Sekolah', category: 'Hemat Energi & Rendah Karbon' },
        { id: '6', name: 'Membakar Daun Kering di Halaman', category: 'Boros Emisi' }
      ];
    } else {
      // General Fallback
      categories = ['Organik', 'Anorganik'];
      items = [
        { id: '1', name: 'Apel Busuk', category: 'Organik' },
        { id: '2', name: 'Kotak Susu', category: 'Anorganik' },
        { id: '3', name: 'Kulit Pisang', category: 'Organik' },
        { id: '4', name: 'Botol Plastik', category: 'Anorganik' }
      ];
    }

    // Shuffle items
    setGameItems(items.sort(() => Math.random() - 0.5));
    setBins(categories);

    // Check if node is already completed
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("thinkbin_completed_nodes");
        const completed: number[] = raw ? JSON.parse(raw) : [];
        if (completed.includes(nodeId)) {
          setIsRepeatAttempt(true);
        }
      } catch {
        // ignore
      }
    }
  }, [nodeId, node, router]);

  // Game timer countdown effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (timeLeft <= 0) {
      handleGameOver(score);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver, score]);

  const handleStartGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
    setScore(0);
    setCurrentItemIdx(0);
    setGameOver(false);
  };

  const handleGameOver = async (finalScore?: number) => {
    setGameOver(true);
    const evaluatedScore = finalScore !== undefined ? finalScore : score;
    setScore(evaluatedScore);
    
    // Check if player scored at least 3 correct (or all if < 3) to pass
    const isPassingScore = gameItems.length > 0 && evaluatedScore >= Math.min(3, gameItems.length);
    if (isPassingScore && !hasUnlocked && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      setHasUnlocked(true);
      
      // If already completed / repeat attempt, strictly skip rewarding XP
      if (isRepeatAttempt) {
        setIsRepeatAttempt(true);
        isSubmittingRef.current = false;
        return;
      }

      const xpReward = node?.xpReward || 12;
      const coinsReward = (node?.coinReward || 15) + 10;

      // Record node completion in Supabase via Atomic RPC (idempotent & safe)
      const result = await recordNodeCompletion({
        userId: user?.id || 'usr_guest',
        nodeId,
        xpEarned: xpReward,
        coinsEarned: coinsReward,
        isCorrect: true,
      });

      const isRepeat = result.isRepeat || result.xpAwarded === 0;
      setIsRepeatAttempt(isRepeat);

      // Always refresh profile from database to get authoritative XP/coins
      if (user?.id) {
        await refreshProfile(user.id);
      } else if (!isRepeat && result.xpAwarded > 0) {
        updateUser({
          xp: (user?.xp || 0) + result.xpAwarded,
          coins: (user?.coins || 0) + result.coinsAwarded,
        });
      }
      isSubmittingRef.current = false;
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
      handleGameOver(newScore);
    } else {
      setCurrentItemIdx(currentItemIdx + 1);
    }
  };

  const currentItem = gameItems[currentItemIdx];
  const isPassing = gameItems.length > 0 && score >= Math.min(3, gameItems.length);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4">
      
      {/* Top statistics Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-2 border-b border-slate-800">
        <button
          onClick={() => router.push('/belajar')}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold text-xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Peta Belajar</span>
        </button>
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black">
          Tantangan #{nodeId}
        </span>
      </div>

      {/* Main Game Card Interface */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center my-4">
        {!gameStarted ? (
          <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-6 text-center shadow-xl w-full">
            <h1 className="text-xl font-black mb-2">{node?.title || 'Tantangan Interaktif'}</h1>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Pilah sampah yang muncul ke tempat pembuangan yang tepat sebelum waktu habis!
            </p>
            <div className="bg-slate-900/60 rounded-xl p-4 mb-6 border border-slate-700/50 flex justify-around">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Waktu</span>
                <span className="text-sm font-black text-amber-400">30 Detik</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Target Benar</span>
                <span className="text-sm font-black text-emerald-400">Min. 3 Sampah</span>
              </div>
            </div>
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 border-b-4 border-orange-700 text-slate-900 font-black text-sm py-4 rounded-xl hover:brightness-105 active:border-b-0 active:translate-y-1 transition-all"
            >
              Mulai Bermain!
            </button>
          </div>
        ) : gameOver ? (
          <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-6 text-center shadow-xl w-full animate-scaleUp">
            <h2 className="text-lg font-black mb-2">
              {isPassing ? 'Tantangan Berhasil!' : 'Mencoba Sekali Lagi?'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Kamu berhasil menjawab <strong className="text-amber-400 text-sm font-black">{score} / {gameItems.length}</strong> sampah secara benar!
              {isPassing && (
                <span className="text-emerald-400 font-extrabold mt-2 block">
                  {isRepeatAttempt
                    ? "+0 XP / +0 Koin (Latihan Ulang / Sudah Diselesaikan)"
                    : `+${node?.xpReward || 12} XP / +${(node?.coinReward || 15) + 10} Koin (Termasuk bonus tantangan!)`}
                </span>
              )}
            </p>

            <div className="flex flex-col gap-3">
              {isPassing ? (
                <button
                  onClick={() => router.push('/belajar')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-3 px-4 rounded-xl active:translate-y-0.5 transition-all"
                >
                  Selesai & Lanjut Belajar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStartGame}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-3 px-4 rounded-xl active:translate-y-0.5 transition-all"
                  >
                    Main Lagi
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
                    {bin}
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
