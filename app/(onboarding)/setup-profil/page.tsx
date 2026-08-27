"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getStudentsByClass, Student } from "@/lib/roster";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { checkDuplicateUser, saveUserProfile, isUuid, generateUuid } from "@/lib/supabase";

const AVAILABLE_CLASSES = ["9C", "9E", "9F", "8A", "8C", "8E"];

export default function SetupProfilPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);

  // Custom Modal Selector States
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");

  const studentsInClass = selectedClass ? getStudentsByClass(selectedClass) : [];
  const filteredStudents = studentsInClass.filter((s) =>
    s.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls);
    setSelectedStudent(null);
    setDuplicateError(null);
    setShowClassModal(false);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setDuplicateError(null);
    setShowStudentModal(false);
    setStudentSearchQuery("");
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

      const safeId = (user?.id && isUuid(user.id))
        ? user.id
        : (user?.google_id && isUuid(user.google_id))
          ? user.google_id
          : generateUuid();

      // Save user profile
      const updatedProfile = {
        id: safeId,
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
    <div
      className="relative flex flex-col min-h-[100dvh] h-[100dvh] overflow-y-auto overscroll-y-contain justify-between p-4 sm:p-5 select-none"
      style={{
        background: "linear-gradient(180deg, #85dd16 0%, #68c309 100%)",
      }}
    >
      <div className="w-full max-w-[390px] mx-auto flex flex-col flex-1 justify-center py-2">
        
        {/* Step Progress Badge */}
        <div className="inline-flex self-start bg-[#f0fdf4] border-[2px] border-[#15803d] text-[#14532d] text-[12px] font-fredoka font-black px-3.5 py-1 rounded-full mb-3 shadow-xs">
          <span>Langkah 1 dari 2: Setup Profil</span>
        </div>

        {/* Main White Card Container */}
        <div className="w-full bg-white rounded-[28px] border-[3px] border-[#1e293b] shadow-[0_8px_0_#1e293b] p-5 flex flex-col gap-4">
          
          {/* Header */}
          <div>
            <h1 className="font-fredoka font-black text-[23px] text-[#0b1a2d] leading-tight mb-1">
              Lengkapi Data Dirimu
            </h1>
            <p className="font-nunito font-bold text-[13px] text-[#475569] leading-snug">
              Pilih kelas dan namamu dari daftar siswa untuk mendaftarkan akun.
            </p>
          </div>

          {/* Connected Google Account Badge */}
          <div className="bg-[#f8fafc] border-[2px] border-[#cbd5e1] rounded-2xl p-2.5 px-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ecfccb] border border-[#84cc16] flex items-center justify-center flex-shrink-0">
              <Image
                src="/screens_assets/logo.png"
                alt="ThinkBin"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-fredoka font-extrabold text-[13.5px] text-[#0f172a] truncate">
                {selectedStudent?.studentName || user?.display_name || "Siswa ThinkBin"}
              </span>
              <span className="font-nunito font-semibold text-[11.5px] text-[#64748b] truncate">
                {user?.email || "siswa@smpn20malang.sch.id"}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* 1. Custom Trigger: Pilih Kelas */}
            <div className="flex flex-col gap-1.5">
              <label className="font-fredoka font-black text-xs text-[#1e293b]">
                1. Pilih Kelas
              </label>
              <button
                type="button"
                onClick={() => setShowClassModal(true)}
                className="w-full h-[52px] bg-white border-[2.5px] border-[#1e293b] rounded-2xl px-4 flex items-center justify-between font-fredoka font-bold text-sm text-[#0f172a] shadow-[0_3px_0_#1e293b] active:translate-y-[2px] active:shadow-[0_1px_0_#1e293b] cursor-pointer transition-all text-left"
              >
                <span className={selectedClass ? "text-[#0f172a]" : "text-[#94a3b8]"}>
                  {selectedClass ? `Kelas ${selectedClass}` : "-- Pilih Kelas Kamu --"}
                </span>
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#475569]">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* 2. Custom Trigger: Pilih Nama Siswa */}
            <div className="flex flex-col gap-1.5">
              <label className="font-fredoka font-black text-xs text-[#1e293b]">
                2. Pilih Nama Kamu
              </label>
              <button
                type="button"
                onClick={() => selectedClass && setShowStudentModal(true)}
                disabled={!selectedClass}
                className={`w-full h-[52px] border-[2.5px] rounded-2xl px-4 flex items-center justify-between font-fredoka font-bold text-sm text-left transition-all ${
                  selectedClass
                    ? "bg-white border-[#1e293b] text-[#0f172a] shadow-[0_3px_0_#1e293b] active:translate-y-[2px] active:shadow-[0_1px_0_#1e293b] cursor-pointer"
                    : "bg-[#f1f5f9] border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed shadow-none"
                }`}
              >
                <span className="truncate pr-2">
                  {selectedStudent
                    ? selectedStudent.studentName
                    : selectedClass
                    ? "-- Pilih Nama Kamu --"
                    : "-- Pilih Kelas Terlebih Dahulu --"}
                </span>
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#475569] flex-shrink-0">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* 3. Nomor Absen (Auto-Filled) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-fredoka font-black text-xs text-[#1e293b]">
                3. Nomor Absen
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={selectedStudent ? `Absen #${selectedStudent.studentNumber}` : ""}
                  placeholder="Terisi otomatis"
                  readOnly
                  className="w-full h-[50px] bg-[#f8fafc] border-[2px] border-[#cbd5e1] rounded-2xl px-4 font-fredoka font-bold text-sm text-[#0f172a] outline-none cursor-default"
                />
                <span className="absolute right-3 bg-[#e2e8f0] text-[#475569] font-fredoka font-black text-[10.5px] px-2.5 py-1 rounded-lg">
                  Auto-fill
                </span>
              </div>
            </div>

            {/* Inline Duplicate Alert Warning */}
            {duplicateError && (
              <div className="bg-[#fef2f2] border-[2px] border-[#f87171] rounded-2xl p-3 flex items-center gap-2 text-[#991b1b] font-nunito font-bold text-xs">
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
                  <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                </svg>
                <span>{duplicateError}</span>
              </div>
            )}

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={!selectedClass || !selectedStudent || isSubmitting}
              className="w-full h-[54px] bg-gradient-to-b from-[#fad85e] to-[#e7a627] hover:brightness-105 disabled:bg-none disabled:bg-[#e2e8f0] disabled:border-[#cbd5e1] disabled:text-[#94a3b8] disabled:shadow-none disabled:cursor-not-allowed border-[3px] border-[#1e293b] rounded-[22px] text-[#1e293b] font-fredoka font-black text-[16px] shadow-[0_5px_0_#1e293b] active:translate-y-[3px] active:shadow-[0_1.5px_0_#1e293b] mt-2 transition-all cursor-pointer uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Memvalidasi..." : "Lanjut ke Kuisioner"}</span>
              {!isSubmitting && <span>→</span>}
            </button>
          </form>
        </div>
      </div>

      {/* ── CUSTOM IN-APP MODAL: PILIH KELAS ── */}
      {showClassModal && (
        <div className="fixed inset-0 bg-[#0f172a]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-[3.5px] border-[#1e293b] rounded-[30px] max-w-[340px] w-full p-5 shadow-[0_16px_36px_rgba(0,0,0,0.35),0_6px_0_#1e293b] flex flex-col gap-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-[2px] border-[#f1f5f9] pb-3">
              <h3 className="font-fredoka font-black text-lg text-[#0f172a]">
                Pilih Kelas
              </h3>
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] border-[2px] border-[#cbd5e1] flex items-center justify-center text-[#475569] active:scale-95 cursor-pointer"
                aria-label="Tutup"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto py-1">
              {AVAILABLE_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleSelectClass(cls)}
                    className={`w-full py-3 px-4 rounded-2xl border-[2px] font-fredoka font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ecfccb] border-[#65a30d] text-[#3f6212] shadow-xs"
                        : "bg-white border-[#e2e8f0] text-[#1e293b] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <span>Kelas {cls}</span>
                    <div
                      className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center ${
                        isSelected
                          ? "border-[#65a30d] bg-[#65a30d]"
                          : "border-[#cbd5e1]"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM IN-APP MODAL: PILIH NAMA SISWA ── */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-[#0f172a]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-[3.5px] border-[#1e293b] rounded-[30px] max-w-[360px] w-full p-5 shadow-[0_16px_36px_rgba(0,0,0,0.35),0_6px_0_#1e293b] flex flex-col gap-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-[2px] border-[#f1f5f9] pb-3">
              <div>
                <h3 className="font-fredoka font-black text-lg text-[#0f172a]">
                  Pilih Nama Kamu
                </h3>
                <span className="font-nunito font-bold text-xs text-[#64748b]">
                  Kelas {selectedClass} • {studentsInClass.length} Siswa
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStudentModal(false);
                  setStudentSearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] border-[2px] border-[#cbd5e1] flex items-center justify-center text-[#475569] active:scale-95 cursor-pointer"
                aria-label="Tutup"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="Cari nama kamu..."
                className="w-full h-11 bg-[#f8fafc] border-[2px] border-[#cbd5e1] focus:border-[#65a30d] rounded-xl px-3.5 pl-9 font-fredoka font-semibold text-xs text-[#0f172a] outline-none"
              />
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#94a3b8] absolute left-3">
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Student List (Clean without Absen suffix) */}
            <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto py-1 pr-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStudent(s)}
                      className={`w-full py-2.5 px-3.5 rounded-xl border-[2px] font-fredoka font-bold text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#ecfccb] border-[#65a30d] text-[#3f6212] shadow-xs"
                          : "bg-white border-[#f1f5f9] text-[#1e293b] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span className="truncate pr-2">{s.studentName}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-[#65a30d] bg-[#65a30d]"
                            : "border-[#cbd5e1]"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 font-nunito font-semibold text-xs text-[#94a3b8]">
                  Nama tidak ditemukan dalam Kelas {selectedClass}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ANTI-DUPLICATE WARNING MODAL ── */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-[#0f172a]/65 backdrop-blur-xs z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-white border-[3.5px] border-[#1e293b] rounded-[28px] max-w-[330px] w-full p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.25),0_6px_0_#1e293b] flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h3 className="font-fredoka font-black text-lg text-[#0f172a] mb-1">
              Data Siswa Sudah Terdaftar!
            </h3>
            <p className="font-nunito font-semibold text-xs text-[#64748b] leading-relaxed mb-5">
              {duplicateError || "Akun dengan kombinasi Kelas dan Nomor Absen ini telah didaftarkan sebelumnya."}
            </p>
            <button
              type="button"
              onClick={() => setShowDuplicateModal(false)}
              className="w-full py-3 bg-[#65a30d] border-[2px] border-[#3f6212] text-white font-fredoka font-black text-sm rounded-xl shadow-[0_3px_0_#3f6212] active:translate-y-0.5 active:shadow-none cursor-pointer uppercase"
            >
              Periksa Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
