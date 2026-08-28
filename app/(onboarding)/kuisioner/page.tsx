"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getSurveyConfig,
  SurveyQuestion,
} from "@/lib/survey-data";
import { saveSurveyAnswers, checkSurveySubmitted } from "@/lib/supabase";
import confetti from "canvas-confetti";

function KuisionerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyType = (searchParams.get("type") as "awal" | "akhir") || "awal";
  const { user, updateUser, refreshProfile } = useAuth();

  const config = getSurveyConfig(surveyType);
  const questions: SurveyQuestion[] = config.questions;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [isFirstReward, setIsFirstReward] = useState<boolean>(true);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState<boolean>(false);
  const [isCheckingInitial, setIsCheckingInitial] = useState<boolean>(true);

  // Check if survey already submitted on load
  useEffect(() => {
    let isMounted = true;
    async function verifySurveyStatus() {
      if (!user?.id) {
        setIsCheckingInitial(false);
        return;
      }
      try {
        const isDone = await checkSurveySubmitted(user.id, surveyType);
        if (isMounted && isDone) {
          setIsAlreadyCompleted(true);
        }
      } catch (err) {
        console.warn("Survey status check failed:", err);
      } finally {
        if (isMounted) {
          setIsCheckingInitial(false);
        }
      }
    }
    verifySurveyStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.id, surveyType]);

  const isAllAnswered = questions.every((q) => answers[q.id]);

  // Trigger celebration confetti when modal appears
  useEffect(() => {
    if (showRewardModal) {
      // First immediate burst
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#85dd16", "#fdda5a", "#38bdf8", "#f97316", "#22c55e"],
      });

      // Second double burst
      const t = setTimeout(() => {
        confetti({
          particleCount: 55,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#85dd16", "#fdda5a", "#38bdf8", "#22c55e"],
        });
        confetti({
          particleCount: 55,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#85dd16", "#fdda5a", "#38bdf8", "#22c55e"],
        });
      }, 250);

      return () => clearTimeout(t);
    }
  }, [showRewardModal]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered || isSubmitting || isSubmittingRef.current || isAlreadyCompleted) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Convert answers keys to strings for storage payload
      const stringAnswers: Record<string, string> = {};
      Object.keys(answers).forEach((k) => {
        stringAnswers[k] = answers[Number(k)];
      });

      // Save to Supabase via Atomic RPC / Local storage
      const res = await saveSurveyAnswers({
        userId: user?.id || "usr_guest",
        googleId: user?.google_id || "google_guest",
        answers: stringAnswers,
        surveyType,
      });

      const awardedFirst = res.isFirstSubmission !== false;
      setIsFirstReward(awardedFirst);

      // Update user state in AuthContext only if first submission
      if (user?.id) {
        await refreshProfile(user.id);
      } else if (awardedFirst) {
        const newXp = (user?.xp || 0) + (res.xpAwarded ?? config.reward.xp);
        const newCoins = (user?.coins || 0) + (res.coinsAwarded ?? config.reward.coins);
        updateUser({
          xp: newXp,
          coins: newCoins,
          onboarding_completed: true,
        });
      }

      setIsAlreadyCompleted(true);
      // Direct immediate celebration
      setShowRewardModal(true);
    } catch (err) {
      console.error("Survey submission error:", err);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleGoToMap = () => {
    router.push("/belajar");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  if (isCheckingInitial) {
    return (
      <div
        className="relative w-full min-h-[100dvh] flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(180deg, #85dd16 0%, #68c309 100%)",
        }}
      >
        <div className="bg-white/95 border-[3px] border-[#1e293b] rounded-[24px] p-6 text-center shadow-[0_5px_0_#1e293b] max-w-[320px] w-full">
          <p className="font-fredoka font-black text-base text-[#1e293b] animate-pulse">
            Memeriksa status kuisioner...
          </p>
        </div>
      </div>
    );
  }

  // Already completed screen view
  if (isAlreadyCompleted && !showRewardModal) {
    return (
      <div
        className="relative w-full min-h-[100dvh] flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(180deg, #85dd16 0%, #68c309 100%)",
        }}
      >
        <div className="bg-white border-[3.5px] border-[#1e293b] rounded-[30px] max-w-[350px] w-full p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.25),0_6px_0_#1e293b] flex flex-col items-center gap-3">
          <div className="w-20 h-20 mb-1 flex items-center justify-center">
            <Image
              src="/screens_assets/mascot_main.png"
              alt="Mascot"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="inline-flex bg-[#ecfccb] border border-[#84cc16] text-[#3f6212] font-fredoka font-black text-xs px-3 py-1 rounded-full">
            {config.stepLabel}
          </div>

          <h2 className="font-fredoka font-black text-xl text-[#0f172a] leading-tight">
            Kuisioner Sudah Selesai!
          </h2>

          <p className="font-nunito font-semibold text-xs text-[#64748b] leading-relaxed">
            Kamu sudah pernah mengisi kuisioner {surveyType === "akhir" ? "akhir" : "awal"} ini dan reward telah ditambahkan ke akunmu.
          </p>

          <div className="flex flex-col gap-2.5 w-full pt-2">
            <button
              type="button"
              onClick={handleGoToMap}
              className="w-full py-3.5 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3px] border-[#1e293b] text-[#1e293b] font-fredoka font-black text-sm rounded-2xl shadow-[0_4px_0_#1e293b] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
            >
              Lanjut ke Peta Belajar
            </button>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="w-full py-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] border-[2.5px] border-[#cbd5e1] text-[#334155] font-fredoka font-bold text-xs rounded-xl shadow-[0_2px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer uppercase tracking-wide"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-[100dvh] h-auto overflow-y-auto overscroll-y-contain flex justify-center select-none p-4 sm:p-5 pb-36"
      style={{
        background: "linear-gradient(180deg, #85dd16 0%, #68c309 100%)",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
      }}
    >
      <div className="w-full max-w-[390px] mx-auto flex flex-col flex-1 py-2">
        
        {/* Step Progress Badge */}
        <div className="inline-flex self-start bg-[#f0fdf4] border-[2px] border-[#15803d] text-[#14532d] text-[12px] font-fredoka font-black px-3.5 py-1 rounded-full mb-3 shadow-xs">
          <span>{config.stepLabel}</span>
        </div>

        {/* Header Title */}
        <div className="mb-4">
          <h1 className="font-fredoka font-black text-[24px] text-[#0b1a2d] leading-tight mb-1">
            {config.title}
          </h1>
          <p className="font-nunito font-bold text-[13.5px] text-[#1e3a1e] leading-snug">
            {config.subtitle}
          </p>
        </div>

        {/* Survey Questions Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border-[3px] border-[#1e293b] rounded-[24px] p-4 shadow-[0_5px_0_#1e293b] flex flex-col gap-3"
            >
              {/* Question Badge & Text */}
              <div className="flex flex-col gap-1">
                <span className="self-start bg-[#ecfccb] border border-[#84cc16] text-[#3f6212] font-fredoka font-black text-[11px] px-2.5 py-0.5 rounded-full">
                  Pertanyaan {idx + 1}/{questions.length}
                </span>
                <h3 className="font-fredoka font-bold text-[14.5px] text-[#0f172a] leading-snug">
                  &ldquo;{q.question}&rdquo;
                </h3>
              </div>

              {/* Options Radio List */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.key;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className={`w-full min-h-[46px] rounded-xl border-[2px] px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#ecfccb] border-[#65a30d] shadow-xs"
                          : "bg-[#f8fafc] border-[#cbd5e1] hover:border-[#94a3b8]"
                      }`}
                    >
                      {/* Option Pill */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-fredoka font-black text-xs flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#65a30d] text-white"
                            : "bg-[#e2e8f0] text-[#64748b]"
                        }`}
                      >
                        {opt.key}
                      </div>

                      {/* Option Text */}
                      <span
                        className={`font-fredoka text-[13px] leading-tight flex-1 ${
                          isSelected
                            ? "font-black text-[#1a2e05]"
                            : "font-semibold text-[#334155]"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={!isAllAnswered || isSubmitting || isAlreadyCompleted}
            className="w-full h-[56px] bg-gradient-to-b from-[#fad85e] to-[#e7a627] hover:brightness-105 disabled:bg-none disabled:bg-[#e2e8f0] disabled:border-[#cbd5e1] disabled:text-[#94a3b8] disabled:shadow-none disabled:cursor-not-allowed border-[3px] border-[#1e293b] rounded-[22px] text-[#1e293b] font-fredoka font-black text-base shadow-[0_5px_0_#1e293b] active:translate-y-[3px] active:shadow-[0_1.5px_0_#1e293b] mt-4 mb-12 transition-all cursor-pointer uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? "Menyimpan Jawaban..." : "Selesai & Lihat Hasil"}</span>
          </button>
        </form>
      </div>

      {/* ── CELEBRATION REWARD MODAL ── */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-[#0f172a]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white border-[3.5px] border-[#1e293b] rounded-[30px] max-w-[340px] w-full p-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.4),0_6px_0_#1e293b] flex flex-col items-center gap-2">
            
            {/* Mascot Celebration Animation */}
            <div className="w-24 h-24 mb-1 flex items-center justify-center">
              <Image
                src="/screens_assets/mascot_main.png"
                alt="Celebration Mascot"
                width={95}
                height={95}
                className="object-contain animate-bounce"
                style={{ animationDuration: "1.5s" }}
              />
            </div>

            <h3 className="font-fredoka font-black text-[22px] text-[#0f172a] leading-tight">
              Kuisioner Selesai!
            </h3>
            
            <p className="font-nunito font-semibold text-xs text-[#64748b] leading-relaxed max-w-[260px]">
              {isFirstReward
                ? "Terima kasih! Kamu telah menyelesaikan kuisioner dan membuka akses petualangan ThinkBin."
                : "Jawaban kuisioner telah diperbarui. Reward XP & Koin hanya diberikan pada pengisian pertama."}
            </p>

            {/* Rewards Pill */}
            {isFirstReward ? (
              <div className="flex items-center justify-center gap-4 bg-[#fffbea] border-[2px] border-[#f59e0b] rounded-2xl p-3 my-2 w-full shadow-inner">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/screens_assets/logo.png"
                    alt="ThinkBin XP"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                  <span className="font-fredoka font-extrabold text-base text-[#16a34a]">
                    +{config.reward.xp} XP
                  </span>
                </div>
                <div className="w-[1.5px] h-6 bg-[#f59e0b]/40" />
                <div className="flex items-center gap-1.5">
                  <span className="font-fredoka font-extrabold text-base text-[#d97706]">
                    +{config.reward.coins} Koin
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#f1f5f9] border-[1.5px] border-[#cbd5e1] rounded-2xl p-2.5 my-2 w-full text-center">
                <span className="font-fredoka font-bold text-xs text-[#64748b]">
                  Reward (+{config.reward.xp} XP / +{config.reward.coins} Koin) sudah diklaim sebelumnya
                </span>
              </div>
            )}

            {/* Action Buttons: Lanjut Belajar (Peta) & Kembali ke Beranda */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={handleGoToMap}
                className="w-full py-3.5 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3px] border-[#1e293b] text-[#1e293b] font-fredoka font-black text-sm rounded-2xl shadow-[0_4px_0_#1e293b] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
              >
                Lanjut ke Peta Belajar
              </button>

              <button
                type="button"
                onClick={handleGoToDashboard}
                className="w-full py-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] border-[2.5px] border-[#cbd5e1] text-[#334155] font-fredoka font-bold text-xs rounded-xl shadow-[0_2px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer uppercase tracking-wide"
              >
                Kembali ke Beranda
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function KuisionerPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center font-fredoka text-sm">Memuat kuisioner...</div>}>
      <KuisionerContent />
    </Suspense>
  );
}
