"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { MODUL_DATA } from "@/lib/modul-data";

export default function BacaanPage() {
  const router = useRouter();
  const params = useParams();
  const nodeId = parseInt(params.nodeId as string);

  const node = MODUL_DATA.find((n) => n.id === nodeId);

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    if (!node) {
      router.push("/belajar");
    }
  }, [node, router]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!node) return null;

  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Fitur suara tidak didukung di browser ini.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullText = `${node.title}. ${node.konsepInti}. Contoh Nyata: ${node.contoh}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    router.push(`/quiz/${node.id}`);
  };

  return (
    <div
      className="relative w-full min-h-[100dvh] h-[100dvh] overflow-y-auto overscroll-y-contain flex justify-center select-none bg-[#ba6c26]"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
      }}
    >
      {/* ── 1. HARDWARE-ACCELERATED WARM LIGHT-BROWN WOOD BACKGROUND ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[#ba6c26]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 30%, rgba(255, 215, 145, 0.25) 0%, rgba(140, 75, 25, 0.15) 100%), repeating-linear-gradient(90deg, #c87a32 0px, #c87a32 40px, #b86a24 40px, #b86a24 42px, #d2863c 42px, #d2863c 90px, #ba6c26 90px, #ba6c26 92px, #cb7d35 92px, #cb7d35 150px)",
          transform: "translateZ(0)",
        }}
      />

      <div className="relative w-full max-w-[420px] flex flex-col justify-between py-4 px-4 min-h-full">
        
        {/* ── 2. DECORATIVE STATIONERY PROPS (Ruler, Crayon, Pencil, Sticky Notes) ── */}
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
          <div className="absolute top-12 -right-5 w-16 h-36 bg-[#f3f7fa] border-l-2 border-[#5a94af] -rotate-18 opacity-95 rounded shadow-lg p-2 flex flex-col gap-2">
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

        {/* ── 3. TOP ROW (Circular Back Button & Clean ThinkBin Logo Card) ── */}
        <header className="relative z-20 flex items-center justify-between px-2 mb-8 mt-1">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/belajar")}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-[#fdda5a] to-[#e5a72d] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] active:translate-y-1 active:shadow-none flex items-center justify-center cursor-pointer transition-transform"
            aria-label="Kembali ke Peta Belajar"
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

        {/* ── 4. NARROWER WHITE READING CARD CONTAINER (Shows generous wood margin on both sides) ── */}
        <div className="relative z-10 w-[90%] max-w-[365px] mx-auto bg-white rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,0.35)] px-4 pt-10 pb-6 flex flex-col gap-4 mb-4">
          
          {/* Floating Pill Badge: Node X / 16 • Bagian Y */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] px-6 py-2 rounded-full z-20 whitespace-nowrap">
            <span className="font-fredoka font-black text-sm text-[#3b1d03] tracking-wide">
              Node {node.id} / 16 • Bagian {node.bagianId}
            </span>
          </div>

          {/* Dengar Suara Pill Button */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`mx-auto px-6 py-1.5 rounded-full font-fredoka font-black text-sm transition-all border-[2.5px] cursor-pointer active:translate-y-0.5 ${
              isPlayingAudio
                ? "bg-[#bbf7d0] border-[#15803d] text-[#14532d] shadow-[0_2px_0_#15803d]"
                : "bg-[#fde8b1] border-[#6b3506] text-[#3b1d03] shadow-[0_2px_0_#6b3506] hover:bg-[#fedc8c]"
            }`}
          >
            {isPlayingAudio ? "Sedang Membaca..." : "Dengar Suara"}
          </button>

          {/* Reading Title (Heading) */}
          <h1 className="font-fredoka font-black text-[18px] text-[#241a10] text-center leading-snug px-2">
            {node.title}
          </h1>

          <div className="w-full h-[1px] bg-[#E7DED4] my-0.5" />

          {/* Konsep Inti Box (Light Cream/Beige) */}
          <div className="w-full bg-[#FFFDF5] border-[1.5px] border-[#EADFC9] rounded-2xl p-3.5 text-justify font-nunito font-semibold text-[13.5px] leading-relaxed text-[#291e13] shadow-inner">
            {node.konsepInti}
          </div>

          {/* Contoh Nyata Box (Light Green) */}
          <div className="w-full bg-[#F0FDF4] border-[1.5px] border-[#BBF7D0] border-l-[5px] border-l-[#22C55E] rounded-2xl p-3.5 flex flex-col gap-1 shadow-xs">
            <div className="font-fredoka font-black text-xs text-[#15803D] flex items-center gap-1.5">
              <span>💡</span>
              <span>Contoh Nyata:</span>
            </div>
            <p className="font-nunito font-bold text-[13px] text-[#166534] leading-relaxed">
              {node.contoh}
            </p>
          </div>

          {/* LANJUT Button */}
          <div className="w-full flex justify-center pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="w-full max-w-[220px] py-3 bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3.5px] border-[#6b3506] shadow-[0_4px_0_#542803] active:translate-y-1 active:shadow-none rounded-2xl font-fredoka font-black text-base text-[#3b1d03] tracking-wider uppercase transition-transform cursor-pointer text-center"
            >
              LANJUT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
