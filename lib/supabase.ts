import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qmofbqocyzrhxheyyyuo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if Supabase is properly configured (URL and valid Anon Key present).
 * Uses the already-resolved variables instead of process.env directly,
 * which ensures this works reliably on the Next.js client side.
 */
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl !== "" &&
    supabaseAnonKey !== "" &&
    supabaseAnonKey !== "placeholder-anon-key"
  );
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: "DUPLICATE_DEVICE" | "DUPLICATE_GOOGLE_ID" | "DUPLICATE_ROSTER";
  message?: string;
}

/**
 * Sign in with Official Real Google OAuth via Supabase Auth
 */
export async function signInWithGoogleOAuth(): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirectTo = `${origin}/setup-profil`;

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.error("Google OAuth error:", error);
      alert(`Pemberitahuan Login Google: ${error.message}`);
    }
  } catch (err) {
    console.error("OAuth exception:", err);
  }
}

/**
 * 3-Layer Anti-Duplicate Check
 */
export async function checkDuplicateUser(params: {
  deviceFingerprint: string;
  googleId: string;
  className: string;
  studentNumber: number;
}): Promise<DuplicateCheckResult> {
  if (isSupabaseConfigured()) {
    try {
      // Layer 2: Check Google ID
      const { data: googleMatch } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("google_id", params.googleId)
        .maybeSingle();

      if (googleMatch) {
        return {
          isDuplicate: true,
          reason: "DUPLICATE_GOOGLE_ID",
          message: "Akun Google ini sudah terdaftar di ThinkBin.",
        };
      }

      // Layer 3: Check Class & Student Number (Roster duplicate)
      const { data: rosterMatch } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("class_name", params.className)
        .eq("student_number", params.studentNumber)
        .maybeSingle();

      if (rosterMatch) {
        return {
          isDuplicate: true,
          reason: "DUPLICATE_ROSTER",
          message: `Nomor Absen #${params.studentNumber} di Kelas ${params.className} sudah didaftarkan siswa lain.`,
        };
      }

      return { isDuplicate: false };
    } catch (err) {
      console.warn("Supabase query error, fallback to local validation:", err);
    }
  }

  // Fallback Local Storage Anti-Duplicate
  if (typeof window !== "undefined") {
    const existingUsersRaw = localStorage.getItem("tb_registered_users");
    const existingUsers: UserProfile[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

    const duplicateRoster = existingUsers.find(
      (u) => u.class_name === params.className && u.student_number === params.studentNumber
    );
    if (duplicateRoster) {
      return {
        isDuplicate: true,
        reason: "DUPLICATE_ROSTER",
        message: `Nomor Absen #${params.studentNumber} di Kelas ${params.className} sudah didaftarkan siswa lain.`,
      };
    }
  }

  return { isDuplicate: false };
}

export function isUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Register User Profile to Supabase & Local State (Pure 0 Start)
 */
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  const safeId: string = (profile.id && isUuid(profile.id) ? profile.id : null)
    || (profile.google_id && isUuid(profile.google_id) ? profile.google_id : null)
    || generateUuid();

  const cleanProfile: UserProfile = {
    ...profile,
    id: safeId,
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("user_profiles").upsert([
        {
          id: cleanProfile.id,
          google_id: cleanProfile.google_id,
          email: cleanProfile.email,
          display_name: cleanProfile.display_name,
          class_name: cleanProfile.class_name,
          student_number: cleanProfile.student_number,
          device_fingerprint: cleanProfile.device_fingerprint,
          coins: cleanProfile.coins || 0,
          xp: cleanProfile.xp || 0,
          streak: cleanProfile.streak || 1,
          selected_frame: cleanProfile.selected_frame || "frame_teal_tech",
          onboarding_completed: cleanProfile.onboarding_completed ?? true,
        },
      ], { onConflict: "id" });
      if (error) {
        console.error("Supabase user_profiles upsert error:", error);
      }
    } catch (err) {
      console.warn("Could not save to Supabase directly, caching locally:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("tb_active_user", JSON.stringify(cleanProfile));
    const existingRaw = localStorage.getItem("tb_registered_users");
    const existing: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(cleanProfile);
    localStorage.setItem("tb_registered_users", JSON.stringify(existing));
  }

  return true;
}

/**
 * Fetch Current User Profile from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        return data as UserProfile;
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("tb_active_user");
    if (raw) return JSON.parse(raw);
  }

  return null;
}

/**
 * Save Survey Responses (Pre/Post survey) and update user XP/Coins in Supabase via Atomic RPC
 */
export async function saveSurveyAnswers(payload: {
  userId: string;
  googleId: string;
  answers: Record<string, string>;
  surveyType: "awal" | "akhir";
}): Promise<{ success: boolean; isFirstSubmission?: boolean; xpAwarded?: number; coinsAwarded?: number; message?: string }> {
  const xpReward = payload.surveyType === "akhir" ? 40 : 20;
  const coinsReward = payload.surveyType === "akhir" ? 50 : 30;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc("submit_survey", {
        p_survey_type: payload.surveyType,
        p_answers: payload.answers,
        p_google_id: payload.googleId,
        p_user_id: payload.userId,
      });

      if (error) {
        console.error("Supabase submit_survey RPC error:", error);
      } else if (data && data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `tb_survey_${payload.surveyType}_${payload.userId}`,
            JSON.stringify(payload.answers)
          );
        }
        return {
          success: true,
          isFirstSubmission: data.is_first_submission,
          xpAwarded: data.xp_awarded,
          coinsAwarded: data.coins_awarded,
        };
      }
    } catch (err) {
      console.warn("Could not call submit_survey RPC:", err);
    }
  }

  return { success: false, message: "Database not configured" };
}

/**
 * Fetch Completed Node IDs for a user from learning_node_progress
 */
export async function fetchUserCompletedNodes(userId: string): Promise<number[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("learning_node_progress")
        .select("node_id")
        .eq("user_id", userId);

      if (!error && data) {
        const nodeIds = data.map((d) => d.node_id);
        if (typeof window !== "undefined") {
          localStorage.setItem("thinkbin_completed_nodes", JSON.stringify(nodeIds));
        }
        return nodeIds;
      }
    } catch (err) {
      console.warn("Could not fetch completed nodes from Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("thinkbin_completed_nodes");
    if (raw) {
      return JSON.parse(raw);
    }
  }

  return [];
}

export interface NodeCompletionResult {
  success: boolean;
  isRepeat: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  currentXp?: number;
  currentCoins?: number;
  message?: string;
}

/**
 * Record Node Completion to Supabase & Increment User XP/Coins via Atomic RPC (Idempotent & Anti-Spam)
 */
export async function recordNodeCompletion(payload: {
  userId: string;
  nodeId: number;
  xpEarned?: number;
  coinsEarned?: number;
  quizAnswer?: string;
  isCorrect?: boolean;
}): Promise<NodeCompletionResult> {
  if (isSupabaseConfigured()) {
    try {
      let { data, error } = await supabase.rpc("complete_node", {
        p_node_id: payload.nodeId,
        p_quiz_answer: payload.quizAnswer || null,
        p_is_correct: payload.isCorrect ?? true,
        p_user_id: payload.userId,
      });

      if (error && error.message?.includes("schema cache")) {
        const retry = await supabase.rpc("complete_node", {
          p_node_id: payload.nodeId,
          p_quiz_answer: payload.quizAnswer || null,
          p_is_correct: payload.isCorrect ?? true,
        });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("complete_node RPC error:", error);
        return { success: false, isRepeat: false, xpAwarded: 0, coinsAwarded: 0, message: error.message };
      }

      if (data && data.success) {
        // Sync local storage mirror
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("thinkbin_completed_nodes");
          let completed: number[] = saved ? JSON.parse(saved) : [];
          if (!completed.includes(payload.nodeId)) {
            completed.push(payload.nodeId);
            localStorage.setItem("thinkbin_completed_nodes", JSON.stringify(completed));
          }
        }

        return {
          success: true,
          isRepeat: !data.is_first_completion,
          xpAwarded: data.xp_awarded ?? 0,
          coinsAwarded: data.coins_awarded ?? 0,
          currentXp: data.current_xp,
          currentCoins: data.current_coins,
        };
      }

      // RPC returned data but success was false (e.g., unauthorized)
      if (data && !data.success) {
        console.error("complete_node RPC rejected:", data.message);
        return { success: false, isRepeat: false, xpAwarded: 0, coinsAwarded: 0, message: data.message };
      }

      // No data returned
      return { success: false, isRepeat: false, xpAwarded: 0, coinsAwarded: 0, message: "No response from server" };
    } catch (err: any) {
      console.error("Could not record node completion via Supabase RPC:", err);
      return { success: false, isRepeat: false, xpAwarded: 0, coinsAwarded: 0, message: err?.message || "Network error" };
    }
  }

  // Supabase not configured — return failure, do NOT pretend it succeeded
  return { success: false, isRepeat: false, xpAwarded: 0, coinsAwarded: 0, message: "Database not configured" };
}

/**
 * Fetch Owned Frames from store_transactions
 */
export async function fetchUserOwnedFrames(userId: string): Promise<string[]> {
  const defaultOwned: string[] = ["frame_teal_tech"];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("store_transactions")
        .select("item_id")
        .eq("user_id", userId);

      if (!error && data) {
        const owned = Array.from(new Set(["frame_teal_tech", ...data.map((d) => d.item_id)]));
        if (typeof window !== "undefined") {
          localStorage.setItem("thinkbin_owned_frames", JSON.stringify(owned));
        }
        return owned;
      }
    } catch (err) {
      console.warn("Could not fetch owned frames from Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("thinkbin_owned_frames");
    if (raw) return JSON.parse(raw);
  }

  return defaultOwned;
}

export interface PurchaseResult {
  success: boolean;
  status?: string;
  message?: string;
  currentCoins?: number;
}

/**
 * Purchase Frame Transaction in Supabase via Atomic RPC
 */
export async function purchaseFrameTransaction(payload: {
  userId: string;
  frameId: string;
  frameName?: string;
  priceCoins?: number;
}): Promise<PurchaseResult> {
  if (isSupabaseConfigured()) {
    try {
      // 1. Try with p_item_id and p_user_id
      let { data, error } = await supabase.rpc("purchase_shop_item", {
        p_item_id: payload.frameId,
        p_user_id: payload.userId,
      });

      // 2. If signature mismatch in schema cache, fallback to p_item_id only (uses auth.uid())
      if (error && error.message?.includes("schema cache")) {
        const retry = await supabase.rpc("purchase_shop_item", {
          p_item_id: payload.frameId,
        });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("purchase_shop_item RPC error:", error);
        return { success: false, message: error.message };
      }

      if (data) {
        if (typeof window !== "undefined" && data.success) {
          const rawOwned = localStorage.getItem("thinkbin_owned_frames");
          const owned: string[] = rawOwned ? JSON.parse(rawOwned) : ["frame_teal_tech"];
          if (!owned.includes(payload.frameId)) {
            owned.push(payload.frameId);
            localStorage.setItem("thinkbin_owned_frames", JSON.stringify(owned));
          }
          localStorage.setItem("thinkbin_selected_frame", payload.frameId);
        }

        return {
          success: data.success,
          status: data.status,
          message: data.message,
          currentCoins: data.current_coins,
        };
      }

      return { success: false, message: "No response from server" };
    } catch (err: any) {
      console.error("Could not process frame purchase via Supabase RPC:", err);
      return { success: false, message: err?.message || "Terjadi kesalahan jaringan" };
    }
  }

  return { success: false, message: "Database not configured" };
}

/**
 * Equip Frame to User Profile via Atomic RPC
 */
export async function equipFrameInDatabase(userId: string, frameId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      let { data, error } = await supabase.rpc("equip_shop_item", {
        p_item_id: frameId,
        p_user_id: userId,
      });

      if (error && error.message?.includes("schema cache")) {
        const retry = await supabase.rpc("equip_shop_item", {
          p_item_id: frameId,
        });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("equip_shop_item RPC error:", error);
      }
    } catch (err) {
      console.warn("Could not equip frame in Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("thinkbin_selected_frame", frameId);
  }

  return true;
}

export interface MysteryBoxResult {
  success: boolean;
  rewardXp?: number;
  currentXp?: number;
  currentCoins?: number;
  message?: string;
}

/**
 * Open Mystery Box in Supabase via Atomic RPC (Price 40 coins, Random 15-39 XP)
 */
export async function openMysteryBoxTransaction(userId: string): Promise<MysteryBoxResult> {
  if (isSupabaseConfigured()) {
    try {
      let { data, error } = await supabase.rpc("open_mystery_box", {
        p_user_id: userId,
      });

      if (error && error.message?.includes("schema cache")) {
        const retry = await supabase.rpc("open_mystery_box");
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("open_mystery_box RPC error:", error);
        return { success: false, message: error.message };
      }

      if (data) {
        return {
          success: data.success,
          rewardXp: data.reward_xp,
          currentXp: data.current_xp,
          currentCoins: data.current_coins,
          message: data.message,
        };
      }

      return { success: false, message: "No response from server" };
    } catch (err: any) {
      console.error("Could not open mystery box via Supabase RPC:", err);
      return { success: false, message: err?.message || "Terjadi kesalahan jaringan" };
    }
  }

  return { success: false, message: "Database not configured" };
}

/**
 * Fetch Live Real-Time Leaderboard from Supabase
 */
export async function fetchLiveLeaderboard(className?: string): Promise<UserProfile[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("user_profiles")
        .select("*")
        .order("xp", { ascending: false });

      if (className && className !== "ALL") {
        query = query.eq("class_name", className);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Leaderboard query error:", error);
        // Return empty — do NOT fall back to localStorage
        return [];
      }
      if (data) {
        return data as UserProfile[];
      }
    } catch (err) {
      console.error("Could not fetch live leaderboard from Supabase:", err);
    }
  }

  return [];
}

export interface ClassLeaderboardItem {
  class_name: string;
  total_xp: number;
  student_count: number;
}

/**
 * Claim Daily Mission Reward in Supabase via Atomic RPC
 */
export async function claimDailyMissionTransaction(payload: {
  userId: string;
  missionId: string;
  coinReward: number;
  xpReward: number;
}): Promise<{ success: boolean; currentCoins?: number; currentXp?: number }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc("claim_daily_mission", {
        p_mission_id: payload.missionId,
        p_coin_reward: payload.coinReward,
        p_xp_reward: payload.xpReward,
        p_user_id: payload.userId,
      });

      if (error) {
        console.error("claim_daily_mission RPC error:", error);
        return { success: false };
      }

      if (data && data.success) {
        return {
          success: true,
          currentCoins: data.current_coins,
          currentXp: data.current_xp,
        };
      }
    } catch (err) {
      console.error("Could not claim daily mission via RPC:", err);
    }
  }

  return { success: false };
}

/**
 * Fetch Class Aggregated Leaderboard (Sum of XP per class)
 */
export async function fetchLiveClassLeaderboard(): Promise<ClassLeaderboardItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("class_name, xp");

      if (error) {
        console.error("Class leaderboard query error:", error);
        return [];
      }

      if (data && data.length > 0) {
        const classMap: Record<string, { total_xp: number; student_count: number }> = {};
        for (const row of data) {
          if (!row.class_name) continue;
          if (!classMap[row.class_name]) {
            classMap[row.class_name] = { total_xp: 0, student_count: 0 };
          }
          classMap[row.class_name].total_xp += (row.xp || 0);
          classMap[row.class_name].student_count += 1;
        }

        const classes = Object.keys(classMap).map((className) => ({
          class_name: className,
          total_xp: classMap[className].total_xp,
          student_count: classMap[className].student_count,
        }));

        return classes.sort((a, b) => b.total_xp - a.total_xp);
      }
    } catch (err) {
      console.error("Could not fetch class leaderboard from Supabase:", err);
    }
  }

  return [];
}
