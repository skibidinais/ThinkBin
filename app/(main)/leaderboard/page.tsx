"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { fetchLiveLeaderboard } from "@/lib/supabase";
import { UserProfile } from "@/types";

type LeaderboardMode = "individu" | "kelas";

interface ClassScore {
  className: string;
  totalXp: number;
  avgXp: number;
  studentCount: number;
}

const ALL_CLASSES = ["9C", "9E", "9F", "8A", "8C", "8E"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<LeaderboardMode>("individu");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [liveStudents, setLiveStudents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const classFilterList = ["ALL", "9C", "9E", "9F", "8A", "8C", "8E"];

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchLiveLeaderboard(selectedClassFilter);
        setLiveStudents(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedClassFilter, user]);

  // Sort and rank students by real XP
  const rankedStudents = liveStudents.map((s, index) => ({
    ...s,
    rank: index + 1,
  }));

  const top1 = rankedStudents[0] || null;
  const top2 = rankedStudents[1] || null;
  const top3 = rankedStudents[2] || null;
  const remainingList = rankedStudents.slice(3);

  // Compute real class ranking
  const classScores: ClassScore[] = ALL_CLASSES.map((cls) => {
    const classUsers = liveStudents.filter((u) => u.class_name === cls);
    const totalXp = classUsers.reduce((sum, u) => sum + (u.xp || 0), 0);
    const avgXp = classUsers.length > 0 ? Math.round(totalXp / classUsers.length) : 0;
    return {
      className: cls,
      totalXp,
      avgXp,
      studentCount: classUsers.length,
    };
  }).sort((a, b) => b.totalXp - a.totalXp);

  const currentUserRank = user
    ? rankedStudents.find(
        (s) => s.class_name === user.class_name && s.student_number === user.student_number
      )
    : null;

  return (
    <div className="relative flex flex-col min-h-full pb-20 select-none bg-gradient-to-b from-[#FFFDF9] to-[#F5E6CC]">
      {/* HEADER WITH MODE SWITCHER */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-3 bg-white/95 backdrop-blur-md border-b-[2.5px] border-[#E5E5E5] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <h1 className="font-fredoka font-extrabold text-xl text-[#382C22]">
            🏆 Leaderboard
          </h1>
          {/* Real-Time Live Pulse Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-fredoka font-bold text-[10px] text-emerald-700">
              Live Database
            </span>
          </div>
        </div>

        {/* Dual Mode Switcher (Individu vs Kelas) */}
        <div className="flex items-center p-1 bg-[#F5E6CC] border-[2px] border-[#D7C4A5] rounded-2xl">
          <button
            type="button"
            onClick={() => setMode("individu")}
            className={`flex-1 py-1.5 rounded-xl font-fredoka font-extrabold text-xs transition-all cursor-pointer ${
              mode === "individu"
                ? "bg-white text-[#382C22] shadow-xs"
                : "text-[#796F65] hover:text-[#382C22]"
            }`}
          >
            👤 Peringkat Individu
          </button>
          <button
            type="button"
            onClick={() => setMode("kelas")}
            className={`flex-1 py-1.5 rounded-xl font-fredoka font-extrabold text-xs transition-all cursor-pointer ${
              mode === "kelas"
                ? "bg-white text-[#382C22] shadow-xs"
                : "text-[#796F65] hover:text-[#382C22]"
            }`}
          >
            🏫 Peringkat Kelas
          </button>
        </div>

        {/* Class Filter Horizontal Pills (Only on Individu Mode) */}
        {mode === "individu" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
            {classFilterList.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassFilter(cls)}
                className={`px-3 py-1 rounded-full font-fredoka font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  selectedClassFilter === cls
                    ? "bg-[#1CB0F6] text-white shadow-xs scale-105"
                    : "bg-white border border-[#E5E5E5] text-[#796F65] hover:bg-gray-100"
                }`}
              >
                {cls === "ALL" ? "Semua Kelas" : `Kelas ${cls}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SKELETON LOADING STATE */}
      {isLoading ? (
        <div className="flex flex-col px-4 pt-6 pb-8 gap-4 animate-pulse">
          {/* Podium Skeleton */}
          <div className="grid grid-cols-3 gap-2 items-end justify-center pt-8 pb-6 border-b border-dashed border-[#E2D3B8]">
            <div className="h-32 bg-[#E2D3B8]/60 rounded-t-2xl"></div>
            <div className="h-44 bg-[#E2D3B8]/80 rounded-t-2xl"></div>
            <div className="h-28 bg-[#E2D3B8]/60 rounded-t-2xl"></div>
          </div>
          {/* List Skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full h-14 bg-white/70 border border-[#E5E5E5] rounded-2xl"
            />
          ))}
        </div>
      ) : mode === "individu" ? (
        /* MODE 1: INDIVIDU LEADERBOARD */
        <div className="flex flex-col px-4 pt-3 pb-8">
          {/* 3D TREE STUMP PODIUM STAGE */}
          <div className="grid grid-cols-3 gap-2 items-end justify-center pt-8 pb-6 border-b-[2px] border-dashed border-[#E2D3B8]">
            {/* RANK 2: Left Stump */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <Image
                  src="/assets/mascot_leonardo.png"
                  alt="Juara 2"
                  width={56}
                  height={56}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <span className="font-fredoka font-bold text-xs text-[#382C22] line-clamp-1 text-center max-w-[90px]">
                {top2 ? top2.display_name.split(" ")[0] : "—"}
              </span>
              <span className="font-nunito font-bold text-[10px] text-[#1CB0F6]">
                {top2 ? `${top2.xp} XP` : "0 XP"}
              </span>

              {/* Tree Stump #2 */}
              <div className="w-full h-20 mt-1 bg-gradient-to-b from-[#8B5A2B] to-[#4A270F] border-[3px] border-[#653C16] rounded-t-2xl flex flex-col items-center justify-center shadow-md relative">
                <div className="w-6 h-6 rounded-full bg-[#E5E5E5] border-[2px] border-[#B0BEC5] flex items-center justify-center font-fredoka font-extrabold text-xs text-[#37474F] shadow-xs">
                  2
                </div>
                <span className="text-[9px] font-fredoka font-bold text-amber-200 mt-0.5">
                  {top2 ? `Kelas ${top2.class_name}` : "—"}
                </span>
              </div>
            </div>

            {/* RANK 1: Center Tallest Stump */}
            <div className="flex flex-col items-center z-10">
              <span className="text-xl -mb-1 animate-bounce">👑</span>
              <div className="relative w-18 h-18 mb-1">
                <Image
                  src="/assets/mascot_max.png"
                  alt="Juara 1"
                  width={72}
                  height={72}
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <span className="font-fredoka font-extrabold text-sm text-[#382C22] line-clamp-1 text-center max-w-[100px]">
                {top1 ? top1.display_name.split(" ")[0] : "—"}
              </span>
              <span className="font-nunito font-bold text-xs text-[#1CB0F6]">
                {top1 ? `${top1.xp} XP` : "0 XP"}
              </span>

              {/* Tree Stump #1 */}
              <div className="w-full h-28 mt-1 bg-gradient-to-b from-[#A06D3B] to-[#5C3214] border-[3.5px] border-[#7A491C] rounded-t-2xl flex flex-col items-center justify-center shadow-lg relative">
                <div className="w-7 h-7 rounded-full bg-[#FFD700] border-[2px] border-[#FFA000] flex items-center justify-center font-fredoka font-extrabold text-sm text-[#795548] shadow-xs">
                  1
                </div>
                <span className="text-[10px] font-fredoka font-bold text-yellow-200 mt-0.5">
                  {top1 ? `Kelas ${top1.class_name}` : "—"}
                </span>
              </div>
            </div>

            {/* RANK 3: Right Stump */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <Image
                  src="/assets/mascot_susan.png"
                  alt="Juara 3"
                  width={56}
                  height={56}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <span className="font-fredoka font-bold text-xs text-[#382C22] line-clamp-1 text-center max-w-[90px]">
                {top3 ? top3.display_name.split(" ")[0] : "—"}
              </span>
              <span className="font-nunito font-bold text-[10px] text-[#1CB0F6]">
                {top3 ? `${top3.xp} XP` : "0 XP"}
              </span>

              {/* Tree Stump #3 */}
              <div className="w-full h-16 mt-1 bg-gradient-to-b from-[#7A4E24] to-[#3D1F0A] border-[3px] border-[#552E0E] rounded-t-2xl flex flex-col items-center justify-center shadow-md relative">
                <div className="w-6 h-6 rounded-full bg-[#CD7F32] border-[2px] border-[#A0522D] flex items-center justify-center font-fredoka font-extrabold text-xs text-white shadow-xs">
                  3
                </div>
                <span className="text-[9px] font-fredoka font-bold text-amber-200 mt-0.5">
                  {top3 ? `Kelas ${top3.class_name}` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* LIST OF REMAINING STUDENTS (Rank 4+) */}
          <div className="flex flex-col gap-2.5 mt-4">
            {remainingList.length === 0 && (
              <div className="p-4 bg-white/70 border border-[#E5E5E5] rounded-2xl text-center font-nunito font-semibold text-xs text-[#796F65]">
                Belum ada siswa lain di kelas ini. Yuk mulai belajar dan kumpulkan XP!
              </div>
            )}

            {remainingList.map((student) => {
              const isCurrentUser =
                user &&
                student.class_name === user.class_name &&
                student.student_number === user.student_number;

              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border-[2px] border-b-[4.5px] transition-all ${
                    isCurrentUser
                      ? "bg-[#F0FDF4] border-[#22C55E] shadow-sm scale-[1.01]"
                      : "bg-white border-[#E5E5E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-fredoka font-extrabold text-xs text-[#796F65]">
                      #{student.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/assets/mascot_leonardo.png"
                        alt="Avatar"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-fredoka font-bold text-xs text-[#382C22] line-clamp-1">
                        {student.display_name} {isCurrentUser && " (Kamu)"}
                      </span>
                      <span className="font-nunito font-semibold text-[10px] text-[#796F65]">
                        Kelas {student.class_name} • Absen #{student.student_number}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-fredoka font-extrabold text-xs text-[#1CB0F6]">
                    <Image
                      src="/assets_game/exp_progress.png"
                      alt="XP"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                    <span>{student.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MODE 2: KELAS LEADERBOARD (6 Classes) */
        <div className="flex flex-col px-4 pt-4 pb-8 gap-3">
          <div className="p-3 bg-[#FFF8E7] border-[2px] border-[#F5B82E] rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <p className="font-nunito font-bold text-xs text-[#713F12]">
              Peringkat kelas dihitung berdasarkan total akumulasi XP seluruh siswa di kelas masing-masing.
            </p>
          </div>

          {classScores.map((cls, index) => {
            const isUserClass = user?.class_name === cls.className;

            return (
              <div
                key={cls.className}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-[2.5px] border-b-[5px] transition-all ${
                  index === 0
                    ? "bg-[#FFF9E6] border-[#F5B82E] shadow-sm"
                    : isUserClass
                    ? "bg-[#F0FDF4] border-[#22C55E] shadow-sm"
                    : "bg-white border-[#E5E5E5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-fredoka font-extrabold text-sm ${
                      index === 0
                        ? "bg-[#FFD700] text-[#795548]"
                        : index === 1
                        ? "bg-[#E5E5E5] text-[#37474F]"
                        : index === 2
                        ? "bg-[#CD7F32] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-fredoka font-extrabold text-sm text-[#382C22]">
                      Kelas {cls.className} {isUserClass && " (Kelasmu)"}
                    </span>
                    <span className="font-nunito font-semibold text-[10.5px] text-[#796F65]">
                      {cls.studentCount} Siswa Terdaftar • Rata-rata {cls.avgXp} XP
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-fredoka font-black text-sm text-[#1CB0F6]">
                  <Image
                    src="/assets_game/exp_progress.png"
                    alt="XP"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                  <span>{cls.totalXp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING PINNED CURRENT USER RANK PILL (Bottom) */}
      {currentUserRank && mode === "individu" && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[390px] bg-[#1E293B] text-white border-[2.5px] border-[#334155] rounded-2xl p-2.5 px-4 flex items-center justify-between shadow-2xl z-40 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#22C55E] text-white font-fredoka font-extrabold text-xs px-2 py-0.5 rounded-md">
              #{currentUserRank.rank}
            </span>
            <div className="flex flex-col">
              <span className="font-fredoka font-bold text-xs text-white line-clamp-1">
                {user?.display_name || "Kamu"}
              </span>
              <span className="font-nunito font-semibold text-[10px] text-slate-300">
                Peringkatmu di {selectedClassFilter === "ALL" ? "Seluruh Sekolah" : `Kelas ${selectedClassFilter}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 font-fredoka font-extrabold text-xs text-[#38BDF8]">
            <Image
              src="/assets_game/exp_progress.png"
              alt="XP"
              width={16}
              height={16}
              className="object-contain"
            />
            <span>{user?.xp ?? 0} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}
