"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MODUL_DATA, ModulNode } from "@/lib/modul-data";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured, recordDuelRewardTransaction } from "@/lib/supabase";
import confetti from "canvas-confetti";

interface DuelQuestion {
  question: string;
  options: { value: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

type DuelState = "lobby" | "waiting_room" | "countdown" | "playing" | "round_result" | "game_over";

export default function DuelPage() {
  const router = useRouter();
  const { user, updateUser, refreshProfile } = useAuth();

  // Mode Selection
  const [mode, setMode] = useState<"bot" | "pvp">("bot");
  const [roomCode, setRoomCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [duelState, setDuelState] = useState<DuelState>("lobby");

  // Opponent Details
  const [opponentName, setOpponentName] = useState<string>("Maskot Bin (AI)");
  const [opponentFrame, setOpponentFrame] = useState<string>("frame_teal_tech");
  const [opponentAvatar, setOpponentAvatar] = useState<string>("/screens_assets/mascot_thumbsup_transparent.png");

  // Match / Gameplay State
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // Scores & Answers
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [mySelected, setMySelected] = useState<string | null>(null);
  const [oppSelected, setOppSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Final Results
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [rewardNotice, setRewardNotice] = useState<string>("");

  // Refs for timer & channels
  const channelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHostRef = useRef<boolean>(false);

  // Extract all valid questions from MODUL_DATA
  const getPoolQuestions = (): DuelQuestion[] => {
    const valid = MODUL_DATA.filter((m) => m.question && m.question.options?.length > 0).map(
      (m) => m.question!
    );
    // Shuffle and pick 5
    return [...valid].sort(() => Math.random() - 0.5).slice(0, 5);
  };

  // Clean up channel & timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // ─── START BOT MATCH ───
  const startBotMatch = () => {
    setMode("bot");
    setOpponentName("Maskot Bin (AI)");
    setOpponentFrame("frame_teal_tech");
    setOpponentAvatar("/screens_assets/mascot_thumbsup_transparent.png");

    const picked = getPoolQuestions();
    setQuestions(picked);
    setCurrentIdx(0);
    setMyScore(0);
    setOppScore(0);
    setMySelected(null);
    setOppSelected(null);
    setIsAnswered(false);
    setRewardClaimed(false);

    // Start 3s countdown
    setCountdownNum(3);
    setDuelState("countdown");
  };

  // ─── CREATE PVP ROOM ───
  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setMode("pvp");
    isHostRef.current = true;

    const picked = getPoolQuestions();
    setQuestions(picked);

    if (isSupabaseConfigured()) {
      const channel = supabase.channel(`duel_room_${code}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on("broadcast", { event: "player_joined" }, ({ payload }) => {
          setOpponentName(payload.displayName || "Teman Kelas");
          setOpponentFrame(payload.selectedFrame || "frame_teal_tech");
          // Host sends questions to guest
          channel.send({
            type: "broadcast",
            event: "match_start",
            payload: {
              questions: picked,
              hostName: user?.display_name || "Host",
              hostFrame: user?.selected_frame || "frame_teal_tech",
            },
          });

          setCountdownNum(3);
          setDuelState("countdown");
        })
        .on("broadcast", { event: "submit_answer" }, ({ payload }) => {
          setOppSelected(payload.answer);
          if (payload.isCorrect) {
            setOppScore((prev) => prev + payload.points);
          }
        })
        .subscribe();

      channelRef.current = channel;
    }

    setDuelState("waiting_room");
  };

  // ─── JOIN PVP ROOM ───
  const handleJoinRoom = () => {
    if (!inputCode || inputCode.length < 4) {
      alert("Masukkan 4 digit kode room!");
      return;
    }
    const code = inputCode.trim();
    setRoomCode(code);
    setMode("pvp");
    isHostRef.current = false;

    if (isSupabaseConfigured()) {
      const channel = supabase.channel(`duel_room_${code}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on("broadcast", { event: "match_start" }, ({ payload }) => {
          setQuestions(payload.questions);
          setOpponentName(payload.hostName || "Host Teman");
          setOpponentFrame(payload.hostFrame || "frame_teal_tech");
          setCountdownNum(3);
          setDuelState("countdown");
        })
        .on("broadcast", { event: "submit_answer" }, ({ payload }) => {
          setOppSelected(payload.answer);
          if (payload.isCorrect) {
            setOppScore((prev) => prev + payload.points);
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            // Inform host that we joined
            channel.send({
              type: "broadcast",
              event: "player_joined",
              payload: {
                displayName: user?.display_name || "Challenger",
                selectedFrame: user?.selected_frame || "frame_teal_tech",
              },
            });
          }
        });

      channelRef.current = channel;
    }

    setDuelState("waiting_room");
  };

  // ─── COUNTDOWN TIMER (3, 2, 1, GO!) ───
  useEffect(() => {
    if (duelState === "countdown") {
      if (countdownNum > 0) {
        const timer = setTimeout(() => {
          setCountdownNum((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setDuelState("playing");
        setTimeLeft(15);
      }
    }
  }, [duelState, countdownNum]);

  // ─── QUESTION TIMER & BOT AI ANSWER LOGIC ───
  useEffect(() => {
    if (duelState === "playing") {
      setMySelected(null);
      setOppSelected(null);
      setIsAnswered(false);
      setTimeLeft(15);

      // If playing against BOT, simulate bot answer after 3-7 seconds
      let botTimeout: NodeJS.Timeout | null = null;
      if (mode === "bot" && questions[currentIdx]) {
        const botDelay = Math.floor(Math.random() * 4000) + 3000; // 3 to 7 seconds
        const botIsCorrect = Math.random() < 0.8; // 80% accuracy
        botTimeout = setTimeout(() => {
          const currentQ = questions[currentIdx];
          if (!currentQ) return;
          const chosen = botIsCorrect
            ? currentQ.correctAnswer
            : currentQ.options.find((o) => o.value !== currentQ.correctAnswer)?.value || "A";

          setOppSelected(chosen);
          if (botIsCorrect) {
            const botPoints = 100 + Math.floor((15 - botDelay / 1000) * 3);
            setOppScore((prev) => prev + Math.max(100, botPoints));
          }
        }, botDelay);
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto advance round
            handleRoundEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = timer;

      return () => {
        clearInterval(timer);
        if (botTimeout) clearTimeout(botTimeout);
      };
    }
  }, [duelState, currentIdx]);

  // ─── SUBMIT ANSWER ───
  const handleAnswer = (val: string) => {
    if (isAnswered || duelState !== "playing") return;
    setIsAnswered(true);
    setMySelected(val);

    const currentQ = questions[currentIdx];
    const isCorrect = val === currentQ.correctAnswer;
    const speedBonus = timeLeft * 4; // up to +60 points for speed
    const earnedPoints = isCorrect ? 100 + speedBonus : 0;

    if (isCorrect) {
      setMyScore((prev) => prev + earnedPoints);
    }

    // Broadcast to opponent in PVP mode
    if (mode === "pvp" && channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "submit_answer",
        payload: {
          answer: val,
          isCorrect,
          points: earnedPoints,
        },
      });
    }

    // Move to round result after brief delay
    setTimeout(() => {
      handleRoundEnd();
    }, 1200);
  };

  // ─── ROUND END / NEXT QUESTION ───
  const handleRoundEnd = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setDuelState("playing");
    } else {
      // Game Finished!
      setDuelState("game_over");
    }
  };

  // ─── FINALIZE MATCH & AWARD REWARDS ───
  useEffect(() => {
    if (duelState === "game_over" && !rewardClaimed) {
      setRewardClaimed(true);

      const isWinner = myScore > oppScore;
      const isDraw = myScore === oppScore;

      const xpEarned = isWinner ? 30 : 15;
      const coinsEarned = isWinner ? 25 : 10;

      if (isWinner) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#ffd700", "#ff6b6b", "#48dbfb", "#1dd1a1"],
        });
        setRewardNotice(`KEMENANGAN BESAR! Kamu mendapatkan +${coinsEarned} Koin & +${xpEarned} XP!`);
      } else if (isDraw) {
        setRewardNotice(`HASIL SERI! Kamu mendapatkan +${coinsEarned} Koin & +${xpEarned} XP!`);
      } else {
        setRewardNotice(`PERTANDINGAN HEBAT! Hadiah Partisipasi: +${coinsEarned} Koin & +${xpEarned} XP!`);
      }

      // Record transaction
      recordDuelRewardTransaction({
        userId: user?.id || "usr_guest",
        xpEarned,
        coinsEarned,
        isWinner,
      }).then(() => {
        if (user?.id) refreshProfile(user.id);
        else {
          updateUser({
            xp: (user?.xp || 0) + xpEarned,
            coins: (user?.coins || 0) + coinsEarned,
          });
        }
      });
    }
  }, [duelState, rewardClaimed, myScore, oppScore]);

  const currentQ = questions[currentIdx];

  return (
  // 3D Card tilt calculation helper
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] flex flex-col items-center justify-between select-none overflow-hidden bg-[#1a0b2e] text-white">
      {/* ── AMBIENT LIQUID GLASS LIGHTING ORBS ── */}
      <div className="absolute top-10 -left-20 w-72 h-72 bg-[#9333ea]/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#f97316]/25 rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP HEADER / NAVIGATION BAR WITH LIQUID FROSTED GLASS ── */}
      <header className="relative z-20 w-full max-w-[420px] px-4 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-lg hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Liquid Glass Pill Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-xl border border-white/20 px-5 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
            <path d="M13 19l6 2 2-6-4.5-4.5" />
            <path d="M9.5 6.5L17.5 14.5" />
          </svg>
          <span className="font-fredoka font-black text-xs tracking-wider text-[#fde047] uppercase">
            Arena Duel 1 vs 1
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* ── 1. LOBBY STATE (3D CARD EFFECT & LIQUID GLASS) ── */}
      {duelState === "lobby" && (
        <div className="relative z-10 w-full max-w-[380px] px-4 flex-1 flex flex-col items-center justify-center gap-4 my-auto">
          {/* 3D Interactive Hero Logo Container */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="flex flex-col items-center text-center gap-1 cursor-pointer"
          >
            <div className="w-24 h-24 relative mb-1">
              <Image
                src="/screens_assets/logo.png"
                alt="ThinkBin Logo"
                fill
                className="object-contain drop-shadow-[0_12px_24px_rgba(249,115,22,0.45)]"
              />
            </div>
            <h1 className="font-fredoka font-black text-2xl text-white tracking-wide">
              Tantang Teman & Buktikan!
            </h1>
            <p className="font-nunito font-semibold text-xs text-[#cbd5e1] max-w-[280px]">
              Adu cepat menjawab 5 soal pemilahan sampah. Raih mahkota kemenangan & bonus koin!
            </p>
          </div>

          {/* 3D Mode Card 1: Lawan AI Maskot */}
          <div
            onClick={startBotMatch}
            className="group w-full bg-gradient-to-br from-orange-500/90 via-amber-600/90 to-orange-700/90 backdrop-blur-xl border border-orange-300/40 rounded-3xl p-4 flex items-center justify-between shadow-[0_12px_28px_rgba(234,88,12,0.35)] hover:shadow-[0_16px_36px_rgba(234,88,12,0.5)] active:scale-[0.98] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:rotate-6 transition-transform">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-fredoka font-black text-base text-white leading-tight">Lawan Maskot Bin</h3>
                <p className="font-nunito text-[11px] text-white/80 font-bold mt-0.5">Latihan instan tanpa menunggu</p>
              </div>
            </div>
            <span className="relative z-10 font-fredoka font-black text-xs bg-white text-orange-600 px-3.5 py-1.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
              MAIN
            </span>
          </div>

          {/* 3D Mode Card 2: Mabar Buat Room */}
          <div
            onClick={handleCreateRoom}
            className="group w-full bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-purple-800/90 backdrop-blur-xl border border-purple-300/40 rounded-3xl p-4 flex items-center justify-between shadow-[0_12px_28px_rgba(109,40,217,0.35)] hover:shadow-[0_16px_36px_rgba(109,40,217,0.5)] active:scale-[0.98] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:rotate-6 transition-transform">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-fredoka font-black text-base text-white leading-tight">Buat Room Mabar</h3>
                <p className="font-nunito text-[11px] text-white/80 font-bold mt-0.5">Dapatkan kode & ajak teman sebangku</p>
              </div>
            </div>
            <span className="relative z-10 font-fredoka font-black text-xs bg-white text-purple-700 px-3.5 py-1.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
              BUAT
            </span>
          </div>

          {/* Mode Card 3: Liquid Glass Gabung Room Input */}
          <div className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-3xl p-4 flex flex-col gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <label className="font-fredoka font-bold text-xs text-white/90">
              Punya Kode Room Teman?
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="4 DIGIT KODE"
                className="flex-1 bg-black/40 border border-white/20 rounded-2xl px-3.5 py-2.5 text-center font-fredoka font-black text-base text-yellow-300 placeholder:text-white/30 focus:outline-hidden focus:border-purple-400 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-300/40 text-white font-fredoka font-black text-xs px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                GABUNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. WAITING ROOM (PVP) ── */}
      {duelState === "waiting_room" && (
        <div className="relative z-10 w-full max-w-[360px] px-4 flex-1 flex flex-col items-center justify-center gap-5 text-center my-auto">
          <div className="w-20 h-20 rounded-full border-4 border-[#eab308] border-t-transparent animate-spin flex items-center justify-center bg-white/5 backdrop-blur-md">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6 2 2-6-4.5-4.5" />
              <path d="M9.5 6.5L17.5 14.5" />
            </svg>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-fredoka font-black text-xl text-yellow-300">
              Menunggu Lawan Bergabung...
            </h2>
            <p className="font-nunito text-xs text-white/70">
              Beritahu temanmu untuk memasukkan kode di bawah:
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border-[3px] border-[#eab308] rounded-3xl px-8 py-3.5 shadow-2xl">
            <span className="font-fredoka font-black text-4xl text-[#fde047] tracking-widest">
              {roomCode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDuelState("lobby")}
            className="text-white/60 font-fredoka font-bold text-xs underline cursor-pointer hover:text-white transition-colors"
          >
            Batalkan & Kembali ke Lobi
          </button>
        </div>
      )}

      {/* ── 3. COUNTDOWN STATE ── */}
      {duelState === "countdown" && (
        <div className="relative z-10 w-full max-w-[360px] flex-1 flex flex-col items-center justify-center gap-3 my-auto animate-in zoom-in-75 duration-300">
          <span className="font-fredoka font-black text-7xl text-[#fde047] drop-shadow-[0_8px_24px_rgba(234,179,8,0.6)] animate-ping">
            {countdownNum > 0 ? countdownNum : "MULAI!"}
          </span>
          <span className="font-fredoka font-bold text-sm text-white/80">
            Bersiaplah! Pertandingan Dimulai!
          </span>
        </div>
      )}

      {/* ── 4. MATCH PLAYING SCREEN (3D CARD PERSPECTIVE) ── */}
      {duelState === "playing" && currentQ && (
        <div className="relative z-10 w-full max-w-[380px] px-3 flex-1 flex flex-col justify-between pb-6 pt-1">
          
          {/* Top Player Status Duel Bar with Liquid Glass */}
          <div className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-3xl p-3 flex items-center justify-between shadow-2xl mb-2">
            {/* Player Me */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full border-2 border-emerald-400 bg-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                <Image
                  src="/screens_assets/mascot_thumbsup_transparent.png"
                  alt="My Avatar"
                  width={30}
                  height={30}
                />
              </div>
              <div className="text-left">
                <span className="block font-fredoka font-bold text-[11px] text-white truncate max-w-[75px]">
                  {user?.display_name || "Kamu"}
                </span>
                <span className="font-fredoka font-black text-xs text-emerald-400">
                  {myScore} Poin
                </span>
              </div>
            </div>

            {/* VS Badge & Timer Pill */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-fredoka font-black text-xs shadow-lg transition-all ${
                timeLeft <= 5 ? "bg-red-600 border-red-300 animate-pulse text-white" : "bg-amber-500 border-amber-200 text-slate-950"
              }`}>
                {timeLeft}s
              </div>
              <span className="font-fredoka font-bold text-[9px] text-white/60 mt-0.5">
                Soal {currentIdx + 1}/5
              </span>
            </div>

            {/* Opponent */}
            <div className="flex items-center gap-2.5 flex-row-reverse">
              <div className="relative w-10 h-10 rounded-full border-2 border-rose-400 bg-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                <Image
                  src={opponentAvatar}
                  alt="Opponent Avatar"
                  width={30}
                  height={30}
                />
              </div>
              <div className="text-right">
                <span className="block font-fredoka font-bold text-[11px] text-white truncate max-w-[75px]">
                  {opponentName}
                </span>
                <span className="font-fredoka font-black text-xs text-rose-400">
                  {oppScore} Poin
                </span>
              </div>
            </div>
          </div>

          {/* 3D Perspective Question Card */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX * 0.5}deg) rotateY(${rotateY * 0.5}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="bg-white rounded-[32px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3.5 my-auto border-2 border-white/40"
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <span className="bg-purple-100 text-purple-700 font-fredoka font-black text-[11px] px-3 py-1 rounded-full">
                Tantangan #{currentIdx + 1}
              </span>
              {isAnswered && (
                <span className="font-fredoka font-bold text-xs text-emerald-600 animate-fade-in">
                  Jawaban Terkunci!
                </span>
              )}
            </div>

            <h2 className="font-fredoka font-extrabold text-[15px] text-[#1e1b4b] leading-snug">
              {currentQ.question}
            </h2>

            {/* 4 Options Grid with smooth 3D press feel */}
            <div className="flex flex-col gap-2.5 pt-1">
              {currentQ.options.map((opt) => {
                const isSelected = mySelected === opt.value;
                const isCorrect = opt.value === currentQ.correctAnswer;
                
                let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-purple-50 hover:border-purple-300 shadow-xs";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-100 border-rose-500 text-rose-900";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-purple-100 border-purple-500 text-purple-900";
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full py-3 px-3.5 rounded-2xl border-[2px] font-fredoka text-[13px] font-bold text-left flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-black text-[11px] flex-shrink-0">
                      {opt.value}
                    </span>
                    <span className="leading-tight flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. GAME OVER / RESULT SCREEN (LIQUID GLASS TROPHY) ── */}
      {duelState === "game_over" && (
        <div className="relative z-10 w-full max-w-[360px] px-4 flex-1 flex flex-col items-center justify-center gap-4 my-auto animate-in zoom-in-95 duration-200">
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-1 shadow-2xl">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
                <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <h2 className="font-fredoka font-black text-2xl text-yellow-300">
              {myScore > oppScore ? "VICTORY! KAMU MENANG!" : myScore === oppScore ? "DRAW! HASIL SERI!" : "DEFEAT! TETAP SEMANGAT!"}
            </h2>
            <p className="font-nunito font-semibold text-xs text-white/80">
              {rewardNotice}
            </p>
          </div>

          {/* Liquid Glass Score Comparison */}
          <div className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex items-center justify-around shadow-2xl">
            <div className="flex flex-col items-center">
              <span className="font-fredoka font-bold text-xs text-white/80">
                {user?.display_name || "Kamu"}
              </span>
              <span className="font-fredoka font-black text-3xl text-emerald-400">
                {myScore}
              </span>
            </div>

            <span className="font-fredoka font-black text-xl text-yellow-400">VS</span>

            <div className="flex flex-col items-center">
              <span className="font-fredoka font-bold text-xs text-white/80">
                {opponentName}
              </span>
              <span className="font-fredoka font-black text-3xl text-rose-400">
                {oppScore}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 w-full pt-2">
            <button
              type="button"
              onClick={startBotMatch}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 border border-amber-300/40 rounded-2xl font-fredoka font-black text-sm text-slate-950 uppercase shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              DUEL LAGI
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-fredoka font-bold text-xs text-white uppercase hover:bg-white/20 transition-all cursor-pointer"
            >
              KEMBALI KE BERANDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

