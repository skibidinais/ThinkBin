"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getSurveyConfig,
  SurveyQuestion,
} from "@/lib/survey-data";
import { saveSurveyAnswers } from "@/lib/supabase";

function KuisionerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyType = (searchParams.get("type") as "awal" | "akhir") || "awal";
  const { user, updateUser } = useAuth();

  const config = getSurveyConfig(surveyType);
  const questions: SurveyQuestion[] = config.questions;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  const isAllAnswered = questions.every((q) => answers[q.id]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Convert answers keys to strings for storage payload
      const stringAnswers: Record<string, string> = {};
      Object.keys(answers).forEach((k) => {
        stringAnswers[k] = answers[Number(k)];
      });

      // Save to Supabase / Local storage
      await saveSurveyAnswers({
        userId: user?.id || "usr_guest",
        googleId: user?.google_id || "google_guest",
        answers: stringAnswers,
        surveyType,
      });

      // Update user state in AuthContext
      const newXp = (user?.xp || 0) + config.reward.xp;
      const newCoins = (user?.coins || 0) + config.reward.coins;

      updateUser({
        xp: newXp,
        coins: newCoins,
        onboarding_completed: true,
      });

      setShowRewardModal(true);
    } catch (err) {
      console.error("Survey submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div
      className="relative w-full min-h-[100dvh] h-[100dvh] overflow-y-auto overscroll-y-contain flex justify-center select-none p-4 sm:p-5 pb-16"
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

        {/* Header Title (Clean without emoji) */}
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
              className="bg-white border-[3px] border-[#1e293b] rounded-[24px] p-4 shadow-[0_5px_0_#1e293b]"
            >
              {/* Question Number Badge */}
              <div className="inline-block bg-[#ecfccb] border border-[#84cc16] text-[#3f6212] font-fredoka font-black text-[11px] px-2.5 py-0.5 rounded-lg mb-2">
                Pertanyaan {idx + 1}/{questions.length}
              </div>

              <p className="font-fredoka font-extrabold text-[14.5px] text-[#0f172a] leading-snug mb-3">
                {q.question}
              </p>

              {/* Options Group */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.key;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-[2px] transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#ecfccb] border-[#65a30d] text-[#3f6212] shadow-xs"
                          : "bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b] hover:bg-[#f1f5f9]"
                      }`}
                    >
                      {/* Option Key Badge (A/B/C/D) */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-fredoka font-black text-xs flex-shrink-0 border-[2px] ${
                          isSelected
                            ? "bg-[#65a30d] border-[#3f6212] text-white"
                            : "bg-white border-[#cbd5e1] text-[#475569]"
                        }`}
                      >
                        {opt.key}
                      </div>

                      <span className="font-nunito font-bold text-xs leading-snug">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit CTA Button (Clean without emoji) */}
          <button
            type="submit"
            disabled={!isAllAnswered || isSubmitting}
            className="w-full h-[54px] bg-gradient-to-b from-[#fad85e] to-[#e7a627] hover:brightness-105 disabled:bg-none disabled:bg-[#e2e8f0] disabled:border-[#cbd5e1] disabled:text-[#94a3b8] disabled:shadow-none disabled:cursor-not-allowed border-[3px] border-[#1e293b] rounded-[22px] text-[#1e293b] font-fredoka font-black text-base shadow-[0_5px_0_#1e293b] active:translate-y-[3px] active:shadow-[0_1.5px_0_#1e293b] mt-2 mb-6 transition-all cursor-pointer uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? "Menyimpan Jawaban..." : "Selesai & Masuk Dashboard"}</span>
          </button>
        </form>
      </div>

      {/* CELEBRATION REWARD MODAL (Clean without emoji) */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white border-[3.5px] border-[#1e293b] rounded-[28px] max-w-[340px] w-full p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.35),0_6px_0_#1e293b] flex flex-col items-center">
            <div className="w-20 h-20 mb-2 flex items-center justify-center">
              <Image
                src="/screens_assets/mascot_main.png"
                alt="Celebration Mascot"
                width={80}
                height={80}
                className="object-contain animate-bounce"
              />
            </div>

            <h3 className="font-fredoka font-black text-xl text-[#0f172a] mb-1">
              Kuisioner Selesai!
            </h3>
            <p className="font-nunito font-semibold text-xs text-[#64748b] mb-4">
              Terima kasih! Kamu telah membuka akses penuh ke petualangan ThinkBin.
            </p>

            {/* Rewards Pill */}
            <div className="flex items-center justify-center gap-3 bg-[#fffbea] border-[2px] border-[#f59e0b] rounded-2xl p-3 mb-5 w-full shadow-inner">
              <div className="flex items-center gap-1.5">
                <Image
                  src="/screens_assets/logo.png"
                  alt="ThinkBin XP"
                  width={20}
                  height={20}
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

            <button
              type="button"
              onClick={handleFinishToDashboard}
              className="w-full py-3.5 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3px] border-[#1e293b] text-[#1e293b] font-fredoka font-black text-sm rounded-2xl shadow-[0_4px_0_#1e293b] active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase"
            >
              Masuk ke Beranda
            </button>
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
