'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MODUL_DATA } from '@/lib/modul-data';
import { useAuth } from '@/lib/auth-context';
import { recordNodeCompletion } from '@/lib/supabase';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const nodeId = parseInt(params.nodeId as string, 10);
  const { user, updateUser } = useAuth();

  const node = MODUL_DATA.find(n => n.id === nodeId);
  const question = node?.question;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    if (!node || !question) {
      router.push('/belajar');
    }
  }, [node, question, router]);

  if (!node || !question) return null;

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      // 1. Record node completion in Supabase & Local
      await recordNodeCompletion({
        userId: user?.id || 'usr_guest',
        nodeId,
        xpEarned: node.xpReward,
        coinsEarned: node.coinReward,
        quizAnswer: selectedOption,
        isCorrect: true,
      });

      // 2. Update reactive state in AuthContext
      const currentXp = user?.xp || 0;
      const currentCoins = user?.coins || 0;
      updateUser({
        xp: currentXp + node.xpReward,
        coins: currentCoins + node.coinReward,
      });
    }
  };

  const handleNext = () => {
    router.push('/belajar');
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  // Calculate Progress of current Bagian (4 nodes total per Bagian)
  const currentBagianNodes = MODUL_DATA.filter(n => n.bagianId === node.bagianId);
  const completedInBagian = currentBagianNodes.filter(n => n.id < nodeId).length; 
  const progressPercent = Math.round((completedInBagian / 4) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-12 flex flex-col items-center justify-between">
      {/* Top Header & Section Progress bar */}
      <div className="w-full bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20 shadow-sm flex flex-col gap-2">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => router.push(`/bacaan/${nodeId}`)}
            className="text-slate-400 hover:text-slate-600 font-extrabold text-sm"
          >
            ✕ Batal
          </button>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Cek Pemahaman Node {nodeId}
          </span>
          <div className="w-12"></div> {/* Spacer */}
        </div>

        {/* Progress Bar Visual */}
        <div className="max-w-md mx-auto w-full flex items-center gap-2">
          <div className="flex-1 h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-emerald-600">
            {progressPercent}% Unit
          </span>
        </div>
      </div>

      {/* Main Quiz Section Card */}
      <div className="flex-1 w-full max-w-md px-4 py-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-5">
          {/* Question Text */}
          <h2 className="text-base font-extrabold text-slate-800 leading-snug mb-6">
            {question.question}
          </h2>

          {/* Option list */}
          <div className="flex flex-col gap-3">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.value;
              const isCorrectOpt = opt.value === question.correctAnswer;

              let btnStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
              if (isSelected) {
                btnStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-300";
              }
              if (isSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = "border-green-500 bg-green-50 text-green-800 ring-2 ring-green-300";
                } else if (isSelected) {
                  btnStyle = "border-red-500 bg-red-50 text-red-800 ring-2 ring-red-300";
                } else {
                  btnStyle = "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={opt.value}
                  onClick={() => !isSubmitted && setSelectedOption(opt.value)}
                  disabled={isSubmitted}
                  className={`w-full p-4 rounded-xl border-2 border-b-4 text-left text-xs font-bold transition-all flex items-center gap-3 ${btnStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}>
                    {opt.value}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer Button before feedback */}
      {!isSubmitted && (
        <div className="w-full max-w-md px-4 mt-2">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className={`w-full font-black text-sm py-4 rounded-xl border-b-4 transition-all text-center shadow ${
              selectedOption
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-green-700 text-white hover:brightness-105 active:border-b-0 active:translate-y-1'
                : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            Kirim Jawaban
          </button>
        </div>
      )}

      {/* Slide-Up Bottom Feedback Sheet */}
      {isSubmitted && (
        <div className={`w-full border-t-4 fixed bottom-0 left-0 right-0 z-30 py-6 px-5 flex flex-col items-center animate-slideUp ${
          isCorrect
            ? 'bg-green-50 border-green-500 text-green-900'
            : 'bg-red-50 border-red-500 text-red-900'
        }`}>
          <div className="max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow ${
                isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {isCorrect ? '✓' : '✕'}
              </div>
              <div>
                <h3 className="text-base font-black">
                  {isCorrect ? 'Luar Biasa, Jawaban Benar!' : 'Aduh, Belum Tepat!'}
                </h3>
                <p className="text-xs font-semibold opacity-80 mt-0.5">
                  {isCorrect
                    ? `🎁 Klaim +${node.xpReward} XP & +${node.coinReward} Koin`
                    : 'Ayo coba sekali lagi untuk memahami materinya!'}
                </p>
              </div>
            </div>

            {/* Explanation card */}
            <div className="bg-white/95 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed mb-5">
              <strong className="block text-slate-700 mb-0.5">💡 Pembahasan:</strong>
              {question.explanation}
            </div>

            {/* Action CTAs */}
            <div className="flex gap-3">
              {isCorrect ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-green-600 text-white border-b-4 border-green-800 font-black text-sm py-3 px-4 rounded-xl active:border-b-0 active:translate-y-1 transition-all shadow shadow-green-100"
                >
                  Lanjut Belajar 🎉
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-red-600 text-white border-b-4 border-red-800 font-black text-sm py-3 px-4 rounded-xl active:border-b-0 active:translate-y-1 transition-all shadow shadow-red-100"
                >
                  Coba Lagi 🔁
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
