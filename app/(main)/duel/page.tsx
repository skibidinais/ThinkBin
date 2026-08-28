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

      // Modest and balanced rewards: Bot vs PvP
      const isBotMode = mode === "bot";
      const xpEarned = isBotMode
        ? isWinner
          ? 5
          : 2
        : isWinner
        ? 12
        : 5;

      const coinsEarned = isBotMode
        ? isWinner
          ? 3
          : 1
        : isWinner
        ? 10
        : 3;

      if (isWinner) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#ffd700", "#ff6b6b", "#48dbfb", "#1dd1a1"],
        });
        setRewardNotice(
          isBotMode
            ? `LATIHAN SELESAI! Kamu menang lawan Maskot Bin: +${coinsEarned} Koin & +${xpEarned} XP!`
            : `KEMENANGAN BESAR! Kamu mengalahkan temanmu: +${coinsEarned} Koin & +${xpEarned} XP!`
        );
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
    <div
      className="relative w-full min-h-[100dvh] h-[100dvh] flex flex-col items-center justify-between select-none overflow-hidden bg-cover bg-center bg-no-repeat text-[#2e3b2e]"
      style={{ backgroundImage: "url('/screens_assets/background.png')" }}
    >
      {/* ── DECORATIVE STATIONERY PROPS (Playful Classroom Theme) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-80">
        {/* Orange Sticky Note */}
        <div
          className="absolute top-2 left-6 w-14 h-12 bg-[#f77028] rounded-md shadow-md -rotate-12"
          style={{ filter: "drop-shadow(2px 3px 5px rgba(0,0,0,0.18))" }}
        />
        {/* Yellow Sticky Note */}
        <div
          className="absolute top-1 right-8 w-16 h-12 bg-[#fec432] rounded-md shadow-md rotate-8"
          style={{ filter: "drop-shadow(2px 3px 5px rgba(0,0,0,0.18))" }}
        />
      </div>

      {/* ── TOP HEADER / NAVIGATION BAR (Playful Yellow 3D Style) ── */}
      <header className="relative z-20 w-full max-w-[420px] px-4 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-11 h-11 rounded-full bg-gradient-to-b from-[#fdda5a] to-[#e5a72d] border-[3px] border-[#6b3506] shadow-[0_3px_0_#542803] active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer transition-transform"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#683407" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Playful Yellow Pill Header */}
        <div className="bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3px] border-[#6b3506] shadow-[0_3px_0_#542803] px-5 py-1.5 rounded-full flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#683407" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
            <path d="M13 19l6 2 2-6-4.5-4.5" />
            <path d="M9.5 6.5L17.5 14.5" />
          </svg>
          <span className="font-fredoka font-black text-sm tracking-wide text-[#3b1d03] uppercase">
            Arena Duel 1 vs 1
          </span>
        </div>

        <div className="w-11" />
      </header>

      {/* ── 1. LOBBY STATE (Playful White & Wood 3D Card) ── */}
      {duelState === "lobby" && (
        <div className="relative z-10 w-[92%] max-w-[360px] mx-auto bg-white rounded-[32px] border-[3.5px] border-[#6b3506] shadow-[0_8px_0_#542803,0_16px_32px_rgba(0,0,0,0.2)] p-5 flex flex-col items-center gap-3.5 my-auto">
          {/* Logo & Mascot */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-20 h-20 relative animate-bounce" style={{ animationDuration: "3s" }}>
              <Image
                src="/screens_assets/logo.png"
                alt="ThinkBin Logo"
                fill
                className="object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
              />
            </div>
            <h1 className="font-fredoka font-black text-xl text-[#3b1d03] tracking-wide">
              Tantang Teman & Buktikan!
            </h1>
            <p className="font-nunito font-bold text-xs text-[#6e4e37] leading-relaxed">
              Adu cepat menjawab 5 soal pemilahan sampah. Raih mahkota kemenangan & bonus koin!
            </p>
          </div>

          {/* Mode Option 1: Lawan AI Maskot (Orange 3D Button) */}
          <button
            type="button"
            onClick={startBotMatch}
            className="w-full bg-gradient-to-b from-[#ff8b3d] to-[#e65c00] border-[3px] border-[#8a2202] rounded-[20px] p-3 flex items-center justify-between shadow-[0_4px_0_#751900] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center border-2 border-white/40 text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-fredoka font-black text-sm text-white">Lawan Maskot Bin</h3>
                <p className="font-nunito text-[11px] text-white/90 font-bold">Latihan instan tanpa menunggu</p>
              </div>
            </div>
            <span className="font-fredoka font-black text-xs bg-white text-[#e65c00] px-3 py-1 rounded-full shadow-xs">
              MAIN
            </span>
          </button>

          {/* Mode Option 2: Buat Room Mabar (Green 3D Button) */}
          <button
            type="button"
            onClick={handleCreateRoom}
            className="w-full bg-gradient-to-b from-[#97db2f] to-[#6fb016] border-[3px] border-[#4f870e] rounded-[20px] p-3 flex items-center justify-between shadow-[0_4px_0_#3f6e0b] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center border-2 border-white/40 text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-fredoka font-black text-sm text-white">Buat Room Mabar</h3>
                <p className="font-nunito text-[11px] text-white/90 font-bold">Dapatkan kode & ajak teman</p>
              </div>
            </div>
            <span className="font-fredoka font-black text-xs bg-white text-[#528a10] px-3 py-1 rounded-full shadow-xs">
              BUAT
            </span>
          </button>

          {/* Mode Option 3: Gabung Room Kode */}
          <div className="w-full bg-[#FFFDF5] border-[2px] border-[#EADFC9] rounded-[20px] p-3 flex flex-col gap-2 shadow-inner">
            <label className="font-fredoka font-bold text-xs text-[#6e4e37] text-left">
              Punya Kode Room Teman?
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="4 DIGIT KODE"
                className="flex-1 bg-white border-[2px] border-[#6b3506] rounded-xl px-3 py-2 text-center font-fredoka font-black text-base text-[#3b1d03] placeholder:text-slate-400 focus:outline-hidden focus:border-[#e65c00] transition-colors shadow-xs"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                className="bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[2.5px] border-[#6b3506] text-[#3b1d03] font-fredoka font-black text-xs px-4 py-2.5 rounded-xl shadow-[0_3px_0_#542803] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                GABUNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. WAITING ROOM (PVP) ── */}
      {duelState === "waiting_room" && (
        <div className="relative z-10 w-[92%] max-w-[360px] mx-auto bg-white rounded-[32px] border-[3.5px] border-[#6b3506] shadow-[0_8px_0_#542803,0_16px_32px_rgba(0,0,0,0.2)] p-6 flex flex-col items-center justify-center gap-4 text-center my-auto">
          <div className="w-16 h-16 rounded-full border-[3px] border-[#e65c00] bg-[#FFF8E7] flex items-center justify-center animate-bounce">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#e65c00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6 2 2-6-4.5-4.5" />
              <path d="M9.5 6.5L17.5 14.5" />
            </svg>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-fredoka font-black text-lg text-[#3b1d03]">
              Menunggu Lawan Bergabung...
            </h2>
            <p className="font-nunito text-xs text-[#6e4e37] font-semibold">
              Beritahu temanmu untuk memasukkan kode di bawah:
            </p>
          </div>

          <div className="bg-[#FFFDF5] border-[3px] border-[#6b3506] rounded-2xl px-8 py-3 shadow-[0_3px_0_#542803]">
            <span className="font-fredoka font-black text-4xl text-[#e65c00] tracking-widest">
              {roomCode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDuelState("lobby")}
            className="text-[#8a2202] font-fredoka font-bold text-xs underline cursor-pointer hover:text-[#e65c00] transition-colors"
          >
            Batalkan & Kembali ke Lobi
          </button>
        </div>
      )}

      {/* ── 3. COUNTDOWN STATE ── */}
      {duelState === "countdown" && (
        <div className="relative z-10 w-[90%] max-w-[340px] mx-auto bg-white rounded-[32px] border-[3.5px] border-[#6b3506] shadow-[0_8px_0_#542803] p-8 flex flex-col items-center justify-center gap-3 my-auto animate-in zoom-in-75 duration-300">
          <span className="font-fredoka font-black text-7xl text-[#e65c00] drop-shadow-[0_4px_0_#8a2202] animate-ping">
            {countdownNum > 0 ? countdownNum : "MULAI!"}
          </span>
          <span className="font-fredoka font-bold text-sm text-[#3b1d03]">
            Bersiaplah! Pertandingan Dimulai!
          </span>
        </div>
      )}

      {/* ── 4. MATCH PLAYING SCREEN ── */}
      {duelState === "playing" && currentQ && (
        <div className="relative z-10 w-full max-w-[380px] px-3 flex-1 flex flex-col justify-between pb-4 pt-1">
          
          {/* Top Player Status Duel Bar (Playful Wood Container) */}
          <div className="w-full bg-white border-[3px] border-[#6b3506] rounded-[24px] p-3 flex flex-col gap-2 shadow-[0_4px_0_#542803] mb-2">
            <div className="flex items-center justify-between">
              {/* Player Me */}
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-2xl border-[2.5px] border-[#65a35b] bg-[#ebf9e5] flex items-center justify-center overflow-hidden shadow-xs">
                  <Image
                    src="/screens_assets/mascot_thumbsup_transparent.png"
                    alt="My Avatar"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="text-left">
                  <span className="block font-fredoka font-bold text-[11px] text-[#3b1d03] truncate max-w-[75px]">
                    {user?.display_name || "Kamu"}
                  </span>
                  <span className="font-fredoka font-black text-xs text-[#2c7a1c]">
                    {myScore} Poin
                  </span>
                </div>
              </div>

              {/* Timer Badge (Circular 3D) */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border-[2.5px] border-[#6b3506] flex items-center justify-center font-fredoka font-black text-xs shadow-[0_2px_0_#542803] ${
                  timeLeft <= 5 ? "bg-red-500 text-white animate-pulse" : "bg-[#fad85e] text-[#3b1d03]"
                }`}>
                  {timeLeft}s
                </div>
                <span className="font-fredoka font-bold text-[9px] text-[#6e4e37] mt-0.5">
                  Soal {currentIdx + 1}/5
                </span>
              </div>

              {/* Opponent */}
              <div className="flex items-center gap-2 flex-row-reverse">
                <div className="relative w-10 h-10 rounded-2xl border-[2.5px] border-[#ef4444] bg-[#fef2f2] flex items-center justify-center overflow-hidden shadow-xs">
                  <Image
                    src={opponentAvatar}
                    alt="Opponent Avatar"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="text-right">
                  <span className="block font-fredoka font-bold text-[11px] text-[#3b1d03] truncate max-w-[75px]">
                    {opponentName}
                  </span>
                  <span className="font-fredoka font-black text-xs text-[#b91c1c]">
                    {oppScore} Poin
                  </span>
                </div>
              </div>
            </div>

            {/* Split Playful XP Progress Bar */}
            <div className="w-full flex items-center gap-1 bg-[#FFFDF5] p-1 rounded-xl border border-[#EADFC9]">
              <div className="flex-1 h-2 bg-[#e2e8f0] rounded-md overflow-hidden flex justify-end">
                <div
                  className="h-full bg-[#3fa427] transition-all duration-500 rounded-md"
                  style={{ width: `${Math.min(100, (myScore / 500) * 100)}%` }}
                />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#fad85e]" />
              <div className="flex-1 h-2 bg-[#e2e8f0] rounded-md overflow-hidden flex justify-start">
                <div
                  className="h-full bg-[#ef4444] transition-all duration-500 rounded-md"
                  style={{ width: `${Math.min(100, (oppScore / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Narrower White Question Card */}
          <div className="bg-white rounded-[28px] p-4 shadow-[0_8px_0_#542803,0_16px_32px_rgba(0,0,0,0.15)] flex flex-col gap-3 my-auto border-[3px] border-[#6b3506]">
            <div className="flex items-center justify-between border-b pb-2 border-[#EADFC9]">
              <span className="bg-[#ebf9e5] text-[#2c7a1c] border border-[#a3cca0] font-fredoka font-black text-[11px] px-3 py-0.5 rounded-full">
                Tantangan #{currentIdx + 1}
              </span>
              {isAnswered && (
                <span className="font-fredoka font-bold text-xs text-[#2c7a1c] animate-fade-in">
                  Jawaban Terkunci!
                </span>
              )}
            </div>

            <h2 className="font-fredoka font-black text-[14.5px] text-[#3b1d03] leading-snug">
              {currentQ.question}
            </h2>

            {/* 4 Options Grid (Quiz Consistent 3D Buttons) */}
            <div className="flex flex-col gap-2 pt-1">
              {currentQ.options.map((opt) => {
                const isSelected = mySelected === opt.value;
                const isCorrect = opt.value === currentQ.correctAnswer;
                
                let btnStyle = "bg-[#FFFDF5] border-[#EADFC9] text-[#3b1d03] hover:bg-[#F4F9F1] shadow-[0_2px_0_#EADFC9]";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-[#ebf9e5] border-[#3fa427] text-[#2c7a1c] shadow-[0_2px_0_#3fa427] ring-2 ring-[#3fa427]";
                  } else if (isSelected) {
                    btnStyle = "bg-[#fef2f2] border-[#ef4444] text-[#b91c1c] shadow-[0_2px_0_#ef4444]";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-[#fad85e] border-[#6b3506] text-[#3b1d03] shadow-[0_2px_0_#6b3506]";
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full py-2.5 px-3 rounded-[16px] border-[2.5px] font-fredoka text-[13px] font-bold text-left flex items-center gap-2.5 transition-all active:translate-y-0.5 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border-[2px] border-current flex items-center justify-center font-black text-[11px] flex-shrink-0">
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

      {/* ── 5. GAME OVER / RESULT SCREEN ── */}
      {duelState === "game_over" && (
        <div className="relative z-10 w-[92%] max-w-[360px] mx-auto bg-white rounded-[32px] border-[3.5px] border-[#6b3506] shadow-[0_8px_0_#542803,0_16px_32px_rgba(0,0,0,0.2)] p-6 flex flex-col items-center justify-center gap-4 my-auto animate-in zoom-in-95 duration-200">
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#fad85e] to-[#e7a627] border-[3px] border-[#6b3506] flex items-center justify-center mb-1 shadow-[0_3px_0_#542803]">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#683407" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
                <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <h2 className="font-fredoka font-black text-xl text-[#3b1d03]">
              {myScore > oppScore ? "VICTORY! KAMU MENANG!" : myScore === oppScore ? "DRAW! HASIL SERI!" : "DEFEAT! TETAP SEMANGAT!"}
            </h2>
            <p className="font-nunito font-bold text-xs text-[#6e4e37]">
              {rewardNotice}
            </p>
          </div>

          {/* Score Comparison Card */}
          <div className="w-full bg-[#FFFDF5] border-[2.5px] border-[#6b3506] rounded-2xl p-3.5 flex items-center justify-around shadow-inner">
            <div className="flex flex-col items-center">
              <span className="font-fredoka font-bold text-xs text-[#6e4e37]">
                {user?.display_name || "Kamu"}
              </span>
              <span className="font-fredoka font-black text-3xl text-[#2c7a1c]">
                {myScore}
              </span>
            </div>

            <span className="font-fredoka font-black text-xl text-[#e7a627]">VS</span>

            <div className="flex flex-col items-center">
              <span className="font-fredoka font-bold text-xs text-[#6e4e37]">
                {opponentName}
              </span>
              <span className="font-fredoka font-black text-3xl text-[#b91c1c]">
                {oppScore}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 w-full pt-1">
            <button
              type="button"
              onClick={startBotMatch}
              className="w-full py-3 bg-gradient-to-b from-[#97db2f] via-[#83c623] to-[#6fb016] border-[3px] border-[#4f870e] rounded-[20px] font-fredoka font-black text-sm text-white uppercase shadow-[0_4px_0_#3f6e0b] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              DUEL LAGI
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-2.5 bg-white border-[2.5px] border-[#6b3506] rounded-[20px] font-fredoka font-bold text-xs text-[#3b1d03] uppercase shadow-[0_2px_0_#542803] active:translate-y-0.5 hover:bg-[#FFFDF5] transition-all cursor-pointer"
            >
              KEMBALI KE BERANDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


