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
    <div className="flex flex-col min-h-screen bg-[#FFFBEA] p-5 pb-9 justify-between select-none">
      <div className="flex flex-col flex-1">
        {/* Step Progress Badge */}
        <div className="inline-flex self-start bg-[#FEF3C7] border-[1.5px] border-[#F59E0B] text-[#B45309] text-[11.5px] font-fredoka font-bold px-3 py-1 rounded-full mb-3">
          <span>{config.stepLabel}</span>
        </div>

        {/* Header Title */}
        <div className="mb-4">
          <h2 className="font-fredoka font-black text-[22px] text-[#0F172A] mb-1">
            {config.title}
          </h2>
          <p className="font-nunito font-semibold text-[13.5px] text-[#64748B] leading-snug">
            {config.subtitle}
          </p>
        </div>

        {/* Survey Questions Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border-[2px] border-[#E2E8F0] rounded-[20px] p-3.5 shadow-xs"
            >
              {/* Question Number Badge */}
              <span className="inline-block bg-[#FEF3C7] text-[#B45309] font-fredoka font-bold text-[11px] px-2 py-0.5 rounded-md mb-2">
                Pertanyaan {idx + 1}/{questions.length}
              </span>

              <p className="font-fredoka font-extrabold text-sm text-[#0F172A] leading-snug mb-3">
                {q.question}
              </p>

              {/* Options Group */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.key;

                  return (
                    <label
                      key={opt.key}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className="cursor-pointer block"
                    >
                      <div
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border-[2px] transition-all ${
                          isSelected
                            ? "bg-[#F0FDF4] border-[#22C55E] shadow-[0_0_0_1.5px_#22C55E]"
                            : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-gray-100"
                        }`}
                      >
                        {/* Option Key Badge (A/B/C/D) */}
                        <div
                          className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center font-fredoka font-extrabold text-xs flex-shrink-0 border ${
                            isSelected
                              ? "bg-[#22C55E] border-[#15803D] text-white"
                              : "bg-white border-[#CBD5E1] text-[#475569]"
                          }`}
                        >
                          {opt.key}
                        </div>

                        <span className="font-nunito font-bold text-xs text-[#334155] leading-tight">
                          {opt.text}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={!isAllAnswered || isSubmitting}
            className="w-full h-[52px] bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#CBD5E1] disabled:border-[#94A3B8] disabled:shadow-none disabled:cursor-not-allowed border-[2.5px] border-[#15803D] rounded-[18px] text-white font-fredoka font-extrabold text-base shadow-[0_4px_0_#15803D] active:translate-y-[3px] active:shadow-[0_1px_0_#15803D] mt-2 mb-6 transition-all cursor-pointer"
          >
            {isSubmitting ? "Menyimpan Jawaban..." : "Selesai & Masuk Dashboard 🚀"}
          </button>
        </form>
      </div>

      {/* CELEBRATION REWARD MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs z-50 flex items-center justify-center p-5 animate-in zoom-in duration-200">
          <div className="bg-white border-[3px] border-[#22C55E] rounded-[28px] max-w-[340px] w-full p-6 text-center shadow-2xl flex flex-col items-center">
            <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
              <Image
                src="/assets/mascot_leonardo.png"
                alt="Celebration Mascot"
                width={90}
                height={90}
                className="object-contain animate-bounce"
              />
            </div>

            <h3 className="font-fredoka font-black text-xl text-[#0F172A] mb-1">
              Kuisioner Selesai! 🎉
            </h3>
            <p className="font-nunito font-semibold text-xs text-[#64748B] mb-4">
              Terima kasih! Kamu telah membuka akses penuh ke petualangan ThinkBin.
            </p>

            {/* Rewards Pill */}
            <div className="flex items-center justify-center gap-3 bg-[#FFFBEA] border-[2px] border-[#F59E0B] rounded-2xl p-3 mb-5 w-full shadow-inner">
              <div className="flex items-center gap-1.5">
                <Image
                  src="/assets_game/exp_progress.png"
                  alt="XP Daun Petir"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="font-fredoka font-extrabold text-base text-[#1CB0F6]">
                  +{config.reward.xp} XP
                </span>
              </div>
              <div className="w-[1.5px] h-6 bg-[#F59E0B]/40" />
              <div className="flex items-center gap-1.5">
                <Image
                  src="/assets_game/coin.png"
                  alt="Koin Daun Kuning"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="font-fredoka font-extrabold text-base text-[#F57F17]">
                  +{config.reward.coins} Koin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishToDashboard}
              className="w-full py-3.5 bg-[#22C55E] border-[2px] border-[#15803D] text-white font-fredoka font-extrabold text-base rounded-2xl shadow-[0_4px_0_#15803D] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Masuk ke Beranda 🏠
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
