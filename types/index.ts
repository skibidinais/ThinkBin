export interface UserProfile {
  id: string;
  google_id?: string;
  email?: string;
  display_name: string;
  class_name: string;
  student_number: number;
  device_fingerprint?: string;
  avatar_url?: string;
  selected_frame?: string;
  coins: number;
  xp: number;
  streak: number;
  onboarding_completed?: boolean;
}

export interface ClassRosterItem {
  id: number;
  className: string;
  studentName: string;
  studentNumber: number;
}

export interface ModulNode {
  bagian: number;
  bagianTitle: string;
  nodeId: number;
  type: "bacaan+kuis" | "kuis-tantangan";
  title: string;
  xp: number;
  bacaan?: {
    konsepInti: string;
    contoh: string;
  };
  kuis?: {
    pertanyaan: string;
    tipe: string;
    opsi: { id: string; text: string }[];
    jawabanBenar: string;
  };
}

export type NavTabId = "home" | "belajar" | "leaderboard" | "toko" | "profil";
