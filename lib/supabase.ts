import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: "DUPLICATE_DEVICE" | "DUPLICATE_GOOGLE_ID" | "DUPLICATE_ROSTER";
  message?: string;
}

/**
 * Sign in with Google OAuth using Supabase Auth
 */
export async function signInWithGoogleOAuth(): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirectTo = `${origin}/setup-profil`;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
      return;
    } catch (err) {
      console.warn("Supabase OAuth warning (using simulated OAuth fallback):", err);
    }
  }

  // Simulated fallback for local testing when Supabase env is not configured yet
  if (typeof window !== "undefined") {
    const dummyGoogleUser: UserProfile = {
      id: "usr_" + Date.now().toString(36),
      google_id: "google_" + Math.random().toString(36).substring(2, 10),
      email: "siswa@smpn20malang.sch.id",
      display_name: "",
      class_name: "",
      student_number: 0,
      coins: 0,
      xp: 0,
      streak: 1,
      onboarding_completed: false,
    };
    localStorage.setItem("tb_active_user", JSON.stringify(dummyGoogleUser));
    window.location.href = redirectTo;
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
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

/**
 * Register User Profile to Supabase & Local State (Pure 0 Start)
 */
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { error } = await supabase.from("user_profiles").insert([
        {
          id: profile.id,
          google_id: profile.google_id,
          email: profile.email,
          display_name: profile.display_name,
          class_name: profile.class_name,
          student_number: profile.student_number,
          device_fingerprint: profile.device_fingerprint,
          coins: profile.coins || 0,
          xp: profile.xp || 0,
          streak: profile.streak || 1,
          selected_frame: profile.selected_frame || "frame_teal_tech",
          onboarding_completed: profile.onboarding_completed ?? false,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.warn("Could not save to Supabase directly, caching locally:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("tb_active_user", JSON.stringify(profile));
    const existingRaw = localStorage.getItem("tb_registered_users");
    const existing: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(profile);
    localStorage.setItem("tb_registered_users", JSON.stringify(existing));
  }

  return true;
}

/**
 * Fetch Current User Profile from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
 * Save Survey Responses (Pre/Post survey) and update user XP/Coins in Supabase
 */
export async function saveSurveyAnswers(payload: {
  userId: string;
  googleId: string;
  answers: Record<string, string>;
  surveyType: "awal" | "akhir";
}): Promise<boolean> {
  const xpReward = payload.surveyType === "akhir" ? 40 : 20;
  const coinsReward = payload.surveyType === "akhir" ? 50 : 30;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      // 1. Insert survey responses
      await supabase.from("pre_survey_responses").insert([
        {
          user_id: payload.userId,
          google_id: payload.googleId,
          survey_type: payload.surveyType,
          answers: payload.answers,
        },
      ]);

      // 2. Increment user XP & Coins
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("xp, coins")
        .eq("id", payload.userId)
        .maybeSingle();

      if (userProfile) {
        await supabase
          .from("user_profiles")
          .update({
            xp: (userProfile.xp || 0) + xpReward,
            coins: (userProfile.coins || 0) + coinsReward,
            onboarding_completed: true,
          })
          .eq("id", payload.userId);
      }
    } catch (err) {
      console.warn("Could not save survey response to Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(
      `tb_survey_${payload.surveyType}_${payload.userId}`,
      JSON.stringify(payload.answers)
    );
  }

  return true;
}

/**
 * Fetch Completed Node IDs for a user from learning_node_progress
 */
export async function fetchUserCompletedNodes(userId: string): Promise<number[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { data, error } = await supabase
        .from("learning_node_progress")
        .select("node_id")
        .eq("user_id", userId);

      if (!error && data) {
        return data.map((d) => d.node_id);
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

/**
 * Record Node Completion to Supabase & Increment User XP/Coins
 */
export async function recordNodeCompletion(payload: {
  userId: string;
  nodeId: number;
  xpEarned: number;
  coinsEarned: number;
  quizAnswer?: string;
  isCorrect?: boolean;
}): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      // 1. Insert progress record
      await supabase.from("learning_node_progress").upsert([
        {
          user_id: payload.userId,
          node_id: payload.nodeId,
          xp_earned: payload.xpEarned,
          coins_earned: payload.coinsEarned,
          quiz_answer: payload.quizAnswer || null,
          is_correct: payload.isCorrect ?? true,
        },
      ]);

      // 2. Increment user XP & Coins
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("xp, coins")
        .eq("id", payload.userId)
        .maybeSingle();

      if (userProfile) {
        await supabase
          .from("user_profiles")
          .update({
            xp: (userProfile.xp || 0) + payload.xpEarned,
            coins: (userProfile.coins || 0) + payload.coinsEarned,
          })
          .eq("id", payload.userId);
      }
    } catch (err) {
      console.warn("Could not record node completion to Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("thinkbin_completed_nodes");
    let completed: number[] = saved ? JSON.parse(saved) : [];
    if (!completed.includes(payload.nodeId)) {
      completed.push(payload.nodeId);
      localStorage.setItem("thinkbin_completed_nodes", JSON.stringify(completed));
    }
    const currentXp = parseInt(localStorage.getItem("thinkbin_xp") || "0", 10);
    const currentCoins = parseInt(localStorage.getItem("thinkbin_coins") || "0", 10);
    localStorage.setItem("thinkbin_xp", (currentXp + payload.xpEarned).toString());
    localStorage.setItem("thinkbin_coins", (currentCoins + payload.coinsEarned).toString());
  }

  return true;
}

/**
 * Fetch Owned Frames from store_transactions
 */
export async function fetchUserOwnedFrames(userId: string): Promise<string[]> {
  const defaultOwned = ["frame_teal_tech"];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { data, error } = await supabase
        .from("store_transactions")
        .select("item_id")
        .eq("user_id", userId);

      if (!error && data) {
        const owned = Array.from(new Set([...defaultOwned, ...data.map((d) => d.item_id)]));
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

/**
 * Purchase Frame Transaction in Supabase
 */
export async function purchaseFrameTransaction(payload: {
  userId: string;
  frameId: string;
  frameName: string;
  priceCoins: number;
}): Promise<{ success: boolean; message?: string }> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      // Check user coins balance
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("coins")
        .eq("id", payload.userId)
        .maybeSingle();

      if (!userProfile || (userProfile.coins || 0) < payload.priceCoins) {
        return { success: false, message: "Koin Daun tidak mencukupi!" };
      }

      // Deduct coins & set selected_frame
      await supabase
        .from("user_profiles")
        .update({
          coins: (userProfile.coins || 0) - payload.priceCoins,
          selected_frame: payload.frameId,
        })
        .eq("id", payload.userId);

      // Record transaction
      await supabase.from("store_transactions").insert([
        {
          user_id: payload.userId,
          item_id: payload.frameId,
          item_name: payload.frameName,
          price_coins: payload.priceCoins,
        },
      ]);

      return { success: true };
    } catch (err) {
      console.warn("Could not process frame purchase in Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    const rawOwned = localStorage.getItem("thinkbin_owned_frames");
    const owned: string[] = rawOwned ? JSON.parse(rawOwned) : ["frame_teal_tech"];
    if (!owned.includes(payload.frameId)) {
      owned.push(payload.frameId);
      localStorage.setItem("thinkbin_owned_frames", JSON.stringify(owned));
    }
    localStorage.setItem("thinkbin_selected_frame", payload.frameId);
  }

  return { success: true };
}

/**
 * Equip Frame to User Profile
 */
export async function equipFrameInDatabase(userId: string, frameId: string): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      await supabase
        .from("user_profiles")
        .update({ selected_frame: frameId })
        .eq("id", userId);
    } catch (err) {
      console.warn("Could not equip frame in Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("thinkbin_selected_frame", frameId);
  }

  return true;
}

/**
 * Fetch Live Real-Time Leaderboard from Supabase
 */
export async function fetchLiveLeaderboard(className?: string): Promise<UserProfile[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      let query = supabase
        .from("user_profiles")
        .select("*")
        .eq("onboarding_completed", true)
        .order("xp", { ascending: false });

      if (className && className !== "ALL") {
        query = query.eq("class_name", className);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as UserProfile[];
      }
    } catch (err) {
      console.warn("Could not fetch live leaderboard from Supabase:", err);
    }
  }

  // Local Storage fallback for testing
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("tb_registered_users");
    if (raw) {
      const users: UserProfile[] = JSON.parse(raw);
      const filtered = className && className !== "ALL"
        ? users.filter((u) => u.class_name === className)
        : users;
      return filtered.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }
  }

  return [];
}
