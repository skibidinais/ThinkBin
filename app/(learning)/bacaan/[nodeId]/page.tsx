'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MODUL_DATA } from '@/lib/modul-data';

export default function BacaanPage() {
  const router = useRouter();
  const params = useParams();
  const nodeId = parseInt(params.nodeId as string);

  const node = MODUL_DATA.find(n => n.id === nodeId);

  // User input state for Node 16 (Komitmen Hijau)
  const [komitmenText, setKomitmenText] = useState<string>('');
  const [komitmenSubmitted, setKomitmenSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!node) {
      router.push('/belajar');
    }
  }, [node, router]);

  if (!node) return null;

  const isKomitmen = node.type === 'komitmen';

  const handleCompleteKomitmen = () => {
    if (!komitmenText.trim()) return;

    // Save komitmen text
    localStorage.setItem('thinkbin_komitmen', komitmenText);

    // Save completed node
    const savedCompleted = localStorage.getItem('thinkbin_completed_nodes');
    let completed: number[] = savedCompleted ? JSON.parse(savedCompleted) : [];
    if (!completed.includes(nodeId)) {
      completed.push(nodeId);
      localStorage.setItem('thinkbin_completed_nodes', JSON.stringify(completed));
      
      // Update coins & XP
      const xp = parseInt(localStorage.getItem('thinkbin_xp') || '0') + node.xpReward;
      const coins = parseInt(localStorage.getItem('thinkbin_coins') || '0') + node.coinReward;
      localStorage.setItem('thinkbin_xp', xp.toString());
      localStorage.setItem('thinkbin_coins', coins.toString());
    }

    setKomitmenSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* 3D Desktop Ornaments Representation in BG */}
      <div className="absolute top-4 left-4 w-28 h-4 bg-amber-200 rounded shadow-sm opacity-20 transform -rotate-12 pointer-events-none"></div>
      <div className="absolute bottom-8 right-6 w-32 h-6 bg-pink-300 rounded shadow-sm opacity-20 transform rotate-45 pointer-events-none"></div>

      <div className="w-full max-w-lg relative bg-[#fafafa] rounded-2xl shadow-2xl border border-slate-300 p-8 pt-10 select-none">
        
        {/* Skeuomorphic Binder Rings at the Left edge */}
        <div className="absolute -left-3.5 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none z-20">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-6 h-4 bg-gradient-to-r from-slate-400 to-slate-200 rounded-full border-2 border-slate-500 shadow flex items-center justify-center">
              <div className="w-1.5 h-full bg-slate-300 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Lined Paper Lines Background */}
        <div className="absolute inset-y-0 right-0 left-6 bg-[linear-gradient(#f0f0f0_1px,transparent_1px)] bg-[size:100%_1.75rem] pointer-events-none z-0"></div>

        {/* Vertical Red Margin Line */}
        <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-red-300 pointer-events-none z-0"></div>

        {/* Real Content container */}
        <div className="relative z-10 pl-10 font-sans">
          
          {/* Top header navigation */}
          <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 mb-4">
            <button
              onClick={() => router.push('/belajar')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1 bg-slate-200/50 hover:bg-slate-200 px-2.5 py-1 rounded-md"
            >
              ← Kembali
            </button>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
              Bagian {node.bagianId} · Node {node.id}
            </span>
          </div>

          {/* Node Category & Title */}
          <div className="mb-6">
            <span className="inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-300 mb-2">
              {node.pilar}
            </span>
            <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
              {node.title}
            </h1>
          </div>

          {!isKomitmen ? (
            <>
              {/* Concept Section Card */}
              <div className="bg-white/95 rounded-xl border border-slate-200 p-4 shadow-sm mb-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  📝 Konsep Inti
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {node.konsepInti}
                </p>
              </div>

              {/* Example Section Card */}
              <div className="bg-emerald-50/90 rounded-xl border border-emerald-100 p-4 shadow-sm mb-8">
                <h2 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  💡 Contoh Konkret
                </h2>
                <p className="text-sm text-emerald-800 leading-relaxed font-semibold italic">
                  "{node.contoh}"
                </p>
              </div>

              {/* Continue button */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/quiz/${node.id}`)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl border-b-4 border-green-700 hover:brightness-105 active:border-b-0 active:translate-y-1 transition-all shadow-md text-center"
                >
                  Lanjut ke Cek Pemahaman 📖
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Special input screen for Node 16 (Closing Komitmen) */}
              <div className="bg-white/95 rounded-xl border border-slate-200 p-4 shadow-sm mb-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  🎓 Komitmen Hijau Anda
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">
                  {node.konsepInti}
                </p>

                {komitmenSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs font-bold leading-relaxed">
                    🎉 Terima kasih! Komitmen Anda telah dicatat: <br/>
                    <span className="italic mt-1.5 block text-slate-700 font-semibold">"{komitmenText}"</span>
                  </div>
                ) : (
                  <textarea
                    value={komitmenText}
                    onChange={(e) => setKomitmenText(e.target.value)}
                    placeholder="Tulis komitmen aksi hijau Anda di sini..."
                    className="w-full h-24 p-3 border-2 border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                {komitmenSubmitted ? (
                  <button
                    onClick={() => router.push('/belajar')}
                    className="w-full bg-emerald-500 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl hover:bg-emerald-600 active:translate-y-0.5 transition-all text-center"
                  >
                    Kembali ke Peta Belajar 🏆
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteKomitmen}
                    disabled={!komitmenText.trim()}
                    className={`w-full font-extrabold text-sm py-3.5 px-6 rounded-xl border-b-4 text-center transition-all shadow-md ${
                      komitmenText.trim()
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-green-700 text-white hover:brightness-105 active:border-b-0 active:translate-y-1'
                        : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Kirim Komitmen & Selesaikan Belajar 🏁
                  </button>
                )}
              </div>
            </>
          )}

          {/* Pencil Ornament Style Badge */}
          <div className="absolute right-0 bottom-3 transform translate-y-1/2 -rotate-12 flex gap-1 pointer-events-none opacity-40">
            <span className="text-xs">✏️</span>
            <span className="text-xs">📏</span>
            <span className="text-xs">🎨</span>
          </div>

        </div>
      </div>
    </div>
  );
}
