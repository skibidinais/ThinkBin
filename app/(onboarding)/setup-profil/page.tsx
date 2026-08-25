"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getStudentsByClass, Student } from "@/lib/roster";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { checkDuplicateUser, saveUserProfile } from "@/lib/supabase";

const AVAILABLE_CLASSES = ["9C", "9E", "9F", "8A", "8C", "8E"];

export default function SetupProfilPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);

  const studentsInClass = selectedClass ? getStudentsByClass(selectedClass) : [];

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cls = e.target.value;
    setSelectedClass(cls);
    setSelectedStudent(null);
    setDuplicateError(null);
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    const found = studentsInClass.find((s) => s.id === studentId) || null;
    setSelectedStudent(found);
    setDuplicateError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudent) return;

    setIsSubmitting(true);
    setDuplicateError(null);

    try {
      const fingerprint = await getDeviceFingerprint();
      const googleId = user?.google_id || "google_" + Date.now().toString(36);

      // 3-Layer Anti-Duplicate Validation
      const dupCheck = await checkDuplicateUser({
        deviceFingerprint: fingerprint,
        googleId,
        className: selectedClass,
        studentNumber: selectedStudent.studentNumber,
      });

      if (dupCheck.isDuplicate) {
        setDuplicateError(dupCheck.message || "Data siswa ini sudah terdaftar sebelumnya.");
        setShowDuplicateModal(true);
        setIsSubmitting(false);
        return;
      }

      // Save user profile
      const updatedProfile = {
        id: user?.id || "usr_" + Date.now().toString(36),
        google_id: googleId,
        email: user?.email || "siswa@smpn20malang.sch.id",
        display_name: selectedStudent.studentName,
        class_name: selectedClass,
        student_number: selectedStudent.studentNumber,
        device_fingerprint: fingerprint,
        coins: 0,
        xp: 0,
        streak: 1,
        onboarding_completed: false,
      };

      await saveUserProfile(updatedProfile);
      updateUser(updatedProfile);

      // Proceed to Pre-Survey (Kuisioner Awal)
      router.push("/kuisioner?type=awal");
    } catch (err) {
      console.error("Setup profile error:", err);
      setDuplicateError("Terjadi kendala saat menyimpan profil. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBEA] p-5 pb-9 justify-between select-none">
      <div className="flex flex-col flex-1">
        {/* Step Progress Badge */}
        <div className="inline-flex self-start bg-[#EFF6FF] border-[1.5px] border-[#3B82F6] text-[#1D4ED8] text-[11.5px] font-fredoka font-bold px-3 py-1 rounded-full mb-3">
          <span>Langkah 1 dari 2: Setup Profil</span>
        </div>

        {/* Step Header */}
        <div className="mb-4">
          <h2 className="font-fredoka font-black text-[22px] text-[#0F172A] mb-1">
            Lengkapi Data Dirimu
          </h2>
          <p className="font-nunito font-semibold text-[13.5px] text-[#64748B] leading-snug">
            Pilih kelas dan namamu dari daftar siswa untuk mendaftarkan akun.
          </p>
        </div>

        {/* Google User Connected Pill */}
        <div className="bg-white border-[2px] border-[#CBD5E1] rounded-2xl p-2 px-3 flex items-center gap-2.5 mb-4.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Image
              src="/assets/mascot_leonardo.png"
              alt="User Mascot"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-fredoka font-extrabold text-[13.5px] text-[#0F172A] truncate">
              {selectedStudent?.studentName || user?.display_name || "Siswa ThinkBin"}
            </span>
            <span className="font-nunito font-semibold text-[11.5px] text-[#64748B] truncate">
              {user?.email || "siswa@smpn20malang.sch.id"}
            </span>
          </div>
        </div>

        {/* 3-Step Setup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Step 1: Dropdown Kelas */}
          <div className="flex flex-col gap-1.5">
            <label className="font-fredoka font-bold text-xs text-[#334155]" htmlFor="selectClass">
              1. Pilih Kelas
            </label>
            <select
              id="selectClass"
              value={selectedClass}
              onChange={handleClassChange}
              required
              className="w-full h-[50px] bg-white border-[2px] border-[#CBD5E1] focus:border-[#22C55E] rounded-2xl px-3.5 font-fredoka font-bold text-sm text-[#0F172A] outline-none transition-colors"
            >
              <option value="" disabled>-- Pilih Kelas Kamu --</option>
              {AVAILABLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls} {["9C", "9E", "9F"].includes(cls) ? "★ (Treatment)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Dropdown Nama Siswa */}
          <div className="flex flex-col gap-1.5">
            <label className="font-fredoka font-bold text-xs text-[#334155]" htmlFor="selectStudent">
              2. Pilih Nama Kamu
            </label>
            <select
              id="selectStudent"
              value={selectedStudent?.id || ""}
              onChange={handleStudentChange}
              disabled={!selectedClass}
              required
              className="w-full h-[50px] bg-white border-[2px] border-[#CBD5E1] focus:border-[#22C55E] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed rounded-2xl px-3.5 font-fredoka font-bold text-sm text-[#0F172A] outline-none transition-colors"
            >
              <option value="" disabled>
                {selectedClass ? "-- Pilih Nama Kamu --" : "-- Pilih Kelas Terlebih Dahulu --"}
              </option>
              {studentsInClass.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentName} (Absen #{s.studentNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Nomor Absen (Read-Only Auto-Fill) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-fredoka font-bold text-xs text-[#334155]" htmlFor="inputAbsen">
              3. Nomor Absen
            </label>
            <div className="relative flex items-center">
              <input
                id="inputAbsen"
                type="text"
                value={selectedStudent ? `Absen #${selectedStudent.studentNumber}` : ""}
                placeholder="Terisi otomatis"
                readOnly
                className="w-full h-[50px] bg-[#F8FAFC] border-[2px] border-[#CBD5E1] rounded-2xl px-3.5 font-fredoka font-bold text-sm text-[#0F172A] outline-none cursor-default"
              />
              <span className="absolute right-3 bg-[#E2E8F0] text-[#475569] font-fredoka font-extrabold text-[10.5px] px-2 py-1 rounded-md">
                Auto-fill
              </span>
            </div>
          </div>

          {/* Inline Duplicate Alert Warning */}
          {duplicateError && (
            <div className="bg-[#FEF2F2] border-[1.5px] border-[#FCA5A5] rounded-2xl p-3 flex items-center gap-2 text-[#991B1B] font-nunito font-bold text-xs">
              <span>⚠️</span>
              <span>{duplicateError}</span>
            </div>
          )}

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={!selectedClass || !selectedStudent || isSubmitting}
            className="w-full h-[52px] bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#CBD5E1] disabled:border-[#94A3B8] disabled:shadow-none disabled:cursor-not-allowed border-[2.5px] border-[#15803D] rounded-[18px] text-white font-fredoka font-extrabold text-base shadow-[0_4px_0_#15803D] active:translate-y-[3px] active:shadow-[0_1px_0_#15803D] mt-2 transition-all cursor-pointer"
          >
            {isSubmitting ? "Memvalidasi Data..." : "Lanjut ke Kuisioner →"}
          </button>
        </form>
      </div>

      {/* ANTI-DUPLICATE WARNING MODAL */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-[#0F172A]/65 backdrop-blur-xs z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-white border-[3px] border-[#2B2B2B] rounded-[28px] max-w-[330px] w-full p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.25),0_6px_0_#2B2B2B] flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-3xl mb-3">
              🚫
            </div>
            <h3 className="font-fredoka font-black text-lg text-[#0F172A] mb-1">
              Data Siswa Sudah Terdaftar!
            </h3>
            <p className="font-nunito font-semibold text-xs text-[#64748B] leading-relaxed mb-5">
              {duplicateError || "Akun dengan kombinasi Kelas dan Nomor Absen ini telah didaftarkan sebelumnya."}
            </p>
            <button
              type="button"
              onClick={() => setShowDuplicateModal(false)}
              className="w-full py-3 bg-[#22C55E] border-[2px] border-[#15803D] text-white font-fredoka font-extrabold text-sm rounded-xl shadow-[0_3px_0_#15803D] active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              Periksa Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
