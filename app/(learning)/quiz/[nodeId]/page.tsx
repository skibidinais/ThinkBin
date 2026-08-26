"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { MODUL_DATA } from "@/lib/modul-data";
import { useAuth } from "@/lib/auth-context";
import { recordNodeCompletion } from "@/lib/supabase";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const nodeId = parseInt(params.nodeId as string, 10);
  const { user, updateUser } = useAuth();

  const node = MODUL_DATA.find((n) => n.id === nodeId);
  const question = node?.question;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  useEffect(() => {
    if (!node || !question) {
      router.push("/belajar");
    }
  }, [node, question, router]);

  if (!node || !question) return null;

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitted) return;

    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      // 1. Record node completion in Supabase & LocalStorage
      await recordNodeCompletion({
        userId: user?.id || "usr_guest",
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

  const handleRestart = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  const handleContinue = () => {
    router.push("/belajar");
  };

  return (
    <div
      className="relative w-full min-h-[100dvh] h-[100dvh] overflow-y-auto overscroll-y-contain flex justify-center select-none bg-[#1e120b]"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
      }}
    >
      {/* ── 1. HARDWARE-ACCELERATED FIXED WOOD BACKGROUND ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[#1e120b]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 30%, rgba(255, 185, 95, 0.18) 0%, rgba(0, 0, 0, 0.35) 100%), repeating-linear-gradient(90deg, #bb6e2a 0px, #bb6e2a 40px, #b36420 40px, #b36420 42px, #c47833 42px, #c47833 90px, #ae5f1d 90px, #ae5f1d 92px, #be712b 92px, #be712b 150px)",
          transform: "translateZ(0)",
        }}
      />

      <div className="relative w-full max-w-[420px] flex flex-col justify-between py-4 px-3 min-h-full">
        
        {/* ── 2. DECORATIVE STATIONERY PROPS ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Orange Sticky Note */}
          <div
            className="absolute top-2 left-16 w-16 h-14 bg-[#f77028] rounded shadow-md -rotate-12"
            style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}
          />
          {/* Yellow Sticky Note */}
          <div
            className="absolute top-1 left-24 w-24 h-18 bg-[#fec432] rounded shadow-md rotate-6"
            style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}
          />
          {/* Green Sticky Note */}
          <div
            className="absolute top-2 right-28 w-16 h-16 bg-[#cbd833] rounded shadow-md rotate-12"
            style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}
          />

          {/* Ruler on Top Right */}
          <div className="absolute top-12 -right-6 w-16 h-36 bg-[#f3f7fa] border-l-2 border-[#5a94af] -rotate-18 opacity-95 rounded shadow-lg p-2 flex flex-col gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={`h-0.5 bg-[#60a4c4] ${i % 3 === 0 ? "w-6 bg-[#397e9f]" : "w-3.5"}`}
              />
            ))}
          </div>

          {/* Green Crayon on Left */}
          <div className="absolute top-28 -left-4 w-12 h-28 rotate-32 opacity-95">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-[#145e22] ml-2" />
            <div className="w-6 h-20 bg-[#1b732c] rounded-b border border-[#10481c] shadow-md relative overflow-hidden">
              <div className="absolute top-4 left-0 w-full h-8 bg-[#0f481a] flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1b732c]" />
              </div>
            </div>
          </div>

          {/* Black Pencil on Left */}
          <div className="absolute top-64 -left-5 w-14 h-28 -rotate-35 opacity-95">
            <div className="w-2 h-2.5 bg-[#111] mx-auto" />
            <div className="w-4 h-5 bg-[#dfbc8d] mx-auto" />
            <div className="w-4 h-20 bg-[#232323] border-l-2 border-[#111] border-r-2 border-[#3d3d3d] rounded-b shadow-md mx-auto" />
          </div>
        </div>

        {/* ── 3. TOP ROW (Circular Back Button & ThinkBin Logo Card) ── */}
        <header className="relative z-20 flex items-center justify-between px-2 mb-8 mt-1">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push(`/bacaan/${nodeId}`)}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-[#fdda5a] to-[#e5a72d] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] active:translate-y-1 active:shadow-none flex items-center justify-center cursor-pointer transition-transform"
            aria-label="Kembali ke Bacaan"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 mr-0.5">
              <path
                d="M15 19l-7-7 7-7"
                fill="none"
                stroke="#683407"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* ThinkBin Logo Badge Card */}
          <div className="w-24 h-14 bg-white rounded-[22px] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] flex items-center justify-center p-1.5 overflow-hidden">
            <Image
              src="/screens_assets/logo.png"
              alt="ThinkBin Logo"
              width={76}
              height={40}
              className="object-contain max-h-10 w-auto"
            />
          </div>
        </header>

        {/* ── 4. MAIN WHITE QUIZ CARD CONTAINER WITH FLOATING PILL ── */}
        <div className="relative z-10 w-full bg-white rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,0.45)] px-4 pt-10 pb-12 flex flex-col gap-3.5 mb-14">
          
          {/* Floating Pill Badge: Soal Pemahaman • Node X */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] px-6 py-2 rounded-full z-20 whitespace-nowrap">
            <span className="font-fredoka font-black text-base text-[#3b1d03] tracking-wide">
              Soal Pemahaman • Node {node.id}
            </span>
          </div>

          {!isSubmitted ? (
            <>
              {/* Bantuan (Hint) Pill Button */}
              <button
                type="button"
                onClick={() => setShowHintModal(true)}
                className="mx-auto px-6 py-1.5 rounded-full font-fredoka font-black text-sm transition-all border-[2.5px] cursor-pointer bg-[#fde8b1] border-[#6b3506] text-[#3b1d03] shadow-[0_2px_0_#6b3506] hover:bg-[#fedc8c] active:translate-y-0.5"
              >
                Bantuan
              </button>

              {/* Question Header: Number Circle (1) + Question Text */}
              <div className="flex items-start gap-3 pb-3 border-b-[1.5px] border-[#e7ded4]">
                <div className="w-9 h-9 min-w-9 rounded-full border-[2.8px] border-[#291e13] flex items-center justify-center font-fredoka font-black text-base text-[#291e13] flex-shrink-0 mt-0.5">
                  1
                </div>
                <h2 className="font-fredoka font-extrabold text-[15px] text-[#241a10] leading-snug">
                  {question.question}
                </h2>
              </div>

              {/* 4 Lettered Options (A, B, C, D) */}
              <div className="flex flex-col w-full">
                {question.options.map((opt) => {
                  const isSelected = selectedOption === opt.value;

                  return (
                    <div
                      key={opt.value}
                      onClick={() => setSelectedOption(opt.value)}
                      className={`flex items-center gap-3.5 py-3 px-2 border-b-[1.5px] transition-all cursor-pointer rounded-xl ${
                        isSelected
                          ? "bg-[#fff6e4] border-b-[#e5a72d]"
                          : "hover:bg-[#fbf7f1] border-b-[#ece4da]"
                      }`}
                    >
                      {/* Letter Circle (A, B, C, D) */}
                      <div
                        className={`w-8 h-8 min-w-8 rounded-full border-[2.5px] flex items-center justify-center font-fredoka font-black text-sm transition-all flex-shrink-0 ${
                          isSelected
                            ? "bg-[#f6c039] border-[#5c2d03] text-[#3b1d03] scale-105 shadow-xs"
                            : "border-[#291e13] text-[#291e13]"
                        }`}
                      >
                        {opt.value}
                      </div>

                      {/* Option Text */}
                      <span
                        className={`font-fredoka text-[14px] leading-snug transition-colors ${
                          isSelected
                            ? "text-[#8c4200] font-extrabold"
                            : "text-[#291e13] font-bold"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* JAWAB Button */}
              <div className="w-full flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className={`w-full max-w-[200px] py-3 rounded-2xl font-fredoka font-black text-base tracking-wider uppercase transition-transform text-center ${
                    selectedOption
                      ? "bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] active:translate-y-1 active:shadow-none text-[#3b1d03] cursor-pointer"
                      : "bg-[#e2d5c3] border-[3px] border-[#a8937b] text-[#8c7862] shadow-[0_3px_0_#8c7862] cursor-not-allowed opacity-75"
                  }`}
                >
                  JAWAB
                </button>
              </div>
            </>
          ) : (
            /* Result Feedback Card (Consistent Wood Theme, No Unrelated Emojis) */
            <div className="flex flex-col items-center text-center py-2 gap-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-1">
                <Image
                  src="/screens_assets/logo.png"
                  alt="ThinkBin"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <h2 className="font-fredoka font-black text-xl text-[#291e13]">
                {isCorrect ? "Jawaban Benar!" : "Jawaban Kurang Tepat"}
              </h2>

              <div
                className={`px-5 py-2 rounded-2xl font-fredoka font-black text-base border-[2.5px] ${
                  isCorrect
                    ? "bg-[#ebf9e5] border-[#3fa427] text-[#2c7a1c]"
                    : "bg-[#fef2f2] border-[#ef4444] text-[#b91c1c]"
                }`}
              >
                {isCorrect
                  ? `+${node.xpReward} XP • +${node.coinReward} Koin`
                  : "Coba pelajari lagi konsep intinya"}
              </div>

              <p className="font-nunito font-semibold text-xs text-[#553e2a] leading-relaxed max-w-[280px] bg-[#FFFDF5] p-3 rounded-xl border border-[#EADFC9]">
                {question.explanation}
              </p>

              <div className="flex items-center gap-3 w-full justify-center pt-2">
                {!isCorrect ? (
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="flex-1 max-w-[140px] py-3 bg-white border-[3px] border-[#6b3506] shadow-[0_3px_0_#542803] rounded-2xl font-fredoka font-black text-xs text-[#3b1d03] uppercase cursor-pointer"
                  >
                    MAIN LAGI
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 max-w-[160px] py-3 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] active:translate-y-1 active:shadow-none rounded-2xl font-fredoka font-black text-xs text-[#3b1d03] uppercase tracking-wider cursor-pointer"
                >
                  LANJUT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. CARTOON HANDS OVERLAY AT BOTTOM ── */}
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[122%] pointer-events-none z-20">
          <Image
            src="/screens_assets/hands.png"
            alt="Hands holding paper"
            width={520}
            height={190}
            className="w-full h-auto object-contain block drop-shadow-[0_-4px_10px_rgba(0,0,0,0.2)]"
            priority
          />
        </div>

        {/* ── 6. HINT MODAL POPUP ── */}
        {showHintModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border-[4px] border-[#6b3506] shadow-2xl p-5 max-w-[320px] w-full text-center flex flex-col gap-3 animate-in zoom-in-95 duration-150">
              <h3 className="font-fredoka font-black text-base text-[#241a10]">
                Petunjuk / Bantuan
              </h3>

              <div className="w-full bg-[#FFFDF5] border-[1.5px] border-[#EADFC9] rounded-2xl p-3.5 text-justify font-nunito font-semibold text-xs leading-relaxed text-[#291e13]">
                {node.konsepInti}
              </div>

              <button
                type="button"
                onClick={() => setShowHintModal(false)}
                className="w-full py-2.5 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3px] border-[#6b3506] shadow-[0_3px_0_#542803] rounded-2xl font-fredoka font-black text-xs text-[#3b1d03] uppercase cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
