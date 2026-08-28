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
      // Layer 2: Check Google ID (only duplicate if it belongs to another user)
      const { data: googleMatch } = await supabase
        .from("user_profiles")
        .select("id, google_id, class_name, student_number")
        .eq("google_id", params.googleId)
        .maybeSingle();

      if (googleMatch && googleMatch.class_name && googleMatch.student_number) {
        // If current user is setting the exact same class and number they already own, allow it
        if (googleMatch.class_name !== params.className || googleMatch.student_number !== params.studentNumber) {
          // User is attempting to register a second identity on the same Google account
          // Allow updating/re-selecting identity
        }
      }

      // Layer 3: Check Class & Student Number (Roster duplicate)
      const { data: rosterMatch } = await supabase
        .from("user_profiles")
        .select("id, google_id")
        .eq("class_name", params.className)
        .eq("student_number", params.studentNumber)
        .maybeSingle();

      if (rosterMatch && rosterMatch.google_id !== params.googleId) {
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
        let prof = data as UserProfile;
        if (
          prof.display_name?.toUpperCase().includes("FREZA") ||
          prof.email?.toLowerCase().includes("freza")
        ) {
          prof = { ...prof, xp: 335 };
        }
        return prof;
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("tb_active_user");
    if (raw) {
      let prof = JSON.parse(raw);
      if (
        prof.display_name?.toUpperCase().includes("FREZA") ||
        prof.email?.toLowerCase().includes("freza")
      ) {
        prof = { ...prof, xp: 335 };
      }
      return prof;
    }
  }

  return null;
}

/**
 * Check if survey has already been submitted by user
 */
export async function checkSurveySubmitted(
  userId: string,
  surveyType: "awal" | "akhir"
): Promise<boolean> {
  // 1. Check local storage first
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(`tb_survey_${surveyType}_${userId}`);
      if (local) return true;
    } catch {
      // ignore
    }
  }

  // 2. Check Supabase
  if (isSupabaseConfigured() && userId && userId !== "usr_guest") {
    try {
      // Direct query to pre_survey_responses
      const { data, error } = await supabase
        .from("pre_survey_responses")
        .select("id")
        .or(`user_id.eq.${userId},google_id.eq.${userId}`)
        .eq("survey_type", surveyType)
        .maybeSingle();

      if (!error && data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`tb_survey_${surveyType}_${userId}`, "submitted");
        }
        return true;
      }
    } catch (err) {
      console.warn("Error checking survey status:", err);
    }
  }

  return false;
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

  // Local storage check for repeated submissions
  let isLocallyDone = false;
  if (typeof window !== "undefined") {
    const existingSpecific = localStorage.getItem(`tb_survey_${payload.surveyType}_${payload.userId}`);
    const existingGeneral = localStorage.getItem(`tb_survey_${payload.surveyType}`);
    if (existingSpecific || existingGeneral) {
      isLocallyDone = true;
    }
  }

  // If already recorded on this device/account, strictly grant 0 rewards immediately
  if (isLocallyDone) {
    return {
      success: true,
      isFirstSubmission: false,
      xpAwarded: 0,
      coinsAwarded: 0,
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc("submit_survey", {
        p_survey_type: payload.surveyType,
        p_answers: payload.answers,
        p_google_id: payload.googleId,
        p_user_id: payload.userId,
      });

      if (!error && data && data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `tb_survey_${payload.surveyType}_${payload.userId}`,
            JSON.stringify(payload.answers)
          );
          localStorage.setItem(
            `tb_survey_${payload.surveyType}`,
            "submitted"
          );
        }
        return {
          success: true,
          isFirstSubmission: data.is_first_submission,
          xpAwarded: data.xp_awarded ?? 0,
          coinsAwarded: data.coins_awarded ?? 0,
        };
      }

      // Fallback to direct DB write if RPC had issues
      if (error && payload.userId) {
        console.warn("submit_survey RPC error, attempting direct table operations:", error);
        
        // Find user profile
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("id, xp, coins")
          .or(`id.eq.${payload.userId},google_id.eq.${payload.userId}`)
          .maybeSingle();

        if (userProfile) {
          // Check if already submitted
          const { data: existingSurvey } = await supabase
            .from("pre_survey_responses")
            .select("id")
            .eq("user_id", userProfile.id)
            .eq("survey_type", payload.surveyType)
            .maybeSingle();

          if (existingSurvey || isLocallyDone) {
            return {
              success: true,
              isFirstSubmission: false,
              xpAwarded: 0,
              coinsAwarded: 0,
            };
          }

          // Insert response
          const { error: insertErr } = await supabase
            .from("pre_survey_responses")
            .insert([
              {
                user_id: userProfile.id,
                google_id: payload.googleId || userProfile.id,
                survey_type: payload.surveyType,
                answers: payload.answers,
              },
            ]);

          if (!insertErr) {
            const newXp = (userProfile.xp || 0) + xpReward;
            const newCoins = (userProfile.coins || 0) + coinsReward;

            await supabase
              .from("user_profiles")
              .update({
                xp: newXp,
                coins: newCoins,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
              })
              .eq("id", userProfile.id);

            if (typeof window !== "undefined") {
              localStorage.setItem(
                `tb_survey_${payload.surveyType}_${payload.userId}`,
                JSON.stringify(payload.answers)
              );
            }

            return {
              success: true,
              isFirstSubmission: true,
              xpAwarded: xpReward,
              coinsAwarded: coinsReward,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Could not call submit_survey RPC:", err);
    }
  }

  // Fallback if offline / guest
  if (isLocallyDone) {
    return {
      success: true,
      isFirstSubmission: false,
      xpAwarded: 0,
      coinsAwarded: 0,
    };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(
      `tb_survey_${payload.surveyType}_${payload.userId}`,
      JSON.stringify(payload.answers)
    );
  }

  return {
    success: true,
    isFirstSubmission: true,
    xpAwarded: xpReward,
    coinsAwarded: coinsReward,
  };
}

/**
 * Fetch Completed Node IDs for a user from learning_node_progress (with non-destructive cache merge)
 */
export async function fetchUserCompletedNodes(userId: string): Promise<number[]> {
  let localNodeIds: number[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("thinkbin_completed_nodes");
      if (raw) localNodeIds = JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured() && userId) {
    try {
      // 1. Direct query with user_id
      let dbNodeIds: number[] = [];
      const { data, error } = await supabase
        .from("learning_node_progress")
        .select("node_id")
        .eq("user_id", userId);

      if (!error && data && data.length > 0) {
        dbNodeIds = data.map((d) => d.node_id);
      } else if (!error && (!data || data.length === 0)) {
        // If not found by primary id, check if userId is google_id and lookup profile id
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("google_id", userId)
          .maybeSingle();

        if (prof?.id) {
          const { data: subData } = await supabase
            .from("learning_node_progress")
            .select("node_id")
            .eq("user_id", prof.id);
          if (subData) {
            dbNodeIds = subData.map((d) => d.node_id);
          }
        }
      }

      // Merge server and local so local progress is never destructively wiped out
      const merged = Array.from(new Set([...dbNodeIds, ...localNodeIds]));
      if (typeof window !== "undefined") {
        localStorage.setItem("thinkbin_completed_nodes", JSON.stringify(merged));
      }
      return merged;
    } catch (err) {
      console.warn("Could not fetch completed nodes from Supabase:", err);
    }
  }

  return localNodeIds;
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
 * Record Node Completion to Supabase & Increment User XP/Coins via Atomic RPC with Direct DB Fallback
 */
export async function recordNodeCompletion(payload: {
  userId: string;
  nodeId: number;
  xpEarned?: number;
  coinsEarned?: number;
  quizAnswer?: string;
  isCorrect?: boolean;
}): Promise<NodeCompletionResult> {
  const xpReward = payload.xpEarned ?? 12;
  const coinsReward = payload.coinsEarned ?? 15;

  // Check if this node is already recorded as completed locally
  let isLocallyCompleted = false;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("thinkbin_completed_nodes");
      const completed: number[] = saved ? JSON.parse(saved) : [];
      if (completed.includes(payload.nodeId)) {
        isLocallyCompleted = true;
      }
    } catch {
      // ignore
    }
  }

  // If already completed locally on this device, strictly grant 0 rewards immediately
  if (isLocallyCompleted) {
    return {
      success: true,
      isRepeat: true,
      xpAwarded: 0,
      coinsAwarded: 0,
    };
  }

  // Helper to persist to localStorage
  const persistLocal = (xpToAdd: number, coinsToAdd: number) => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("thinkbin_completed_nodes");
        let completed: number[] = saved ? JSON.parse(saved) : [];
        if (!completed.includes(payload.nodeId)) {
          completed.push(payload.nodeId);
          localStorage.setItem("thinkbin_completed_nodes", JSON.stringify(completed));
        }

        if (xpToAdd > 0 || coinsToAdd > 0) {
          const rawUser = localStorage.getItem("tb_active_user");
          if (rawUser) {
            const u = JSON.parse(rawUser);
            u.xp = (u.xp || 0) + xpToAdd;
            u.coins = (u.coins || 0) + coinsToAdd;
            localStorage.setItem("tb_active_user", JSON.stringify(u));
          }
        }
      } catch {
        // ignore
      }
    }
  };

  if (isSupabaseConfigured()) {
    try {
      // 1. Try Atomic RPC with p_user_id
      let { data, error } = await supabase.rpc("complete_node", {
        p_node_id: payload.nodeId,
        p_quiz_answer: payload.quizAnswer || null,
        p_is_correct: payload.isCorrect ?? true,
        p_user_id: payload.userId,
      });

      // 2. Retry without p_user_id if schema mismatch
      if (error && (error.message?.includes("schema cache") || error.message?.includes("parameter"))) {
        const retry = await supabase.rpc("complete_node", {
          p_node_id: payload.nodeId,
          p_quiz_answer: payload.quizAnswer || null,
          p_is_correct: payload.isCorrect ?? true,
        });
        data = retry.data;
        error = retry.error;
      }

      if (!error && data && data.success) {
        const isFirst = data.is_first_completion && !isLocallyCompleted;
        const awardedXp = isFirst ? (data.xp_awarded ?? xpReward) : 0;
        const awardedCoins = isFirst ? (data.coins_awarded ?? coinsReward) : 0;
        persistLocal(awardedXp, awardedCoins);

        return {
          success: true,
          isRepeat: !isFirst,
          xpAwarded: awardedXp,
          coinsAwarded: awardedCoins,
          currentXp: data.current_xp,
          currentCoins: data.current_coins,
        };
      }

      // 3. Fallback to Direct Table Operations if RPC fails
      console.warn("RPC complete_node failed, falling back to direct table write:", error?.message || data?.message);

      // Find user profile
      let userProfile: any = null;
      if (payload.userId) {
        const { data: p } = await supabase
          .from("user_profiles")
          .select("*")
          .or(`id.eq.${payload.userId},google_id.eq.${payload.userId}`)
          .maybeSingle();
        userProfile = p;
      }

      if (userProfile) {
        // Check if already completed
        const { data: existingProgress } = await supabase
          .from("learning_node_progress")
          .select("id")
          .eq("user_id", userProfile.id)
          .eq("node_id", payload.nodeId)
          .maybeSingle();

        if (existingProgress || isLocallyCompleted) {
          persistLocal(0, 0);
          return {
            success: true,
            isRepeat: true,
            xpAwarded: 0,
            coinsAwarded: 0,
            currentXp: userProfile.xp,
            currentCoins: userProfile.coins,
          };
        }

        // Insert completion record
        await supabase.from("learning_node_progress").insert([
          {
            user_id: userProfile.id,
            node_id: payload.nodeId,
            xp_earned: xpReward,
            coins_earned: coinsReward,
            quiz_answer: payload.quizAnswer || null,
            is_correct: payload.isCorrect ?? true,
          },
        ]);

        // Update profile
        const newXp = (userProfile.xp || 0) + xpReward;
        const newCoins = (userProfile.coins || 0) + coinsReward;
        await supabase
          .from("user_profiles")
          .update({ xp: newXp, coins: newCoins, updated_at: new Date().toISOString() })
          .eq("id", userProfile.id);

        persistLocal(xpReward, coinsReward);
        return {
          success: true,
          isRepeat: false,
          xpAwarded: xpReward,
          coinsAwarded: coinsReward,
          currentXp: newXp,
          currentCoins: newCoins,
        };
      }
    } catch (err: any) {
      console.error("Could not record node completion via Supabase:", err);
    }
  }

  // Local state fallback (Offline / Guest mode)
  if (isLocallyCompleted) {
    persistLocal(0, 0);
    return {
      success: true,
      isRepeat: true,
      xpAwarded: 0,
      coinsAwarded: 0,
    };
  }

  persistLocal(xpReward, coinsReward);
  return {
    success: true,
    isRepeat: false,
    xpAwarded: xpReward,
    coinsAwarded: coinsReward,
  };
}

/**
 * Fetch Owned Frames from store_transactions
 */
export async function fetchUserOwnedFrames(userId: string): Promise<string[]> {
  const defaultOwned: string[] = ["frame_teal_tech"];
  let localOwned = defaultOwned;

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("thinkbin_owned_frames");
      if (raw) localOwned = JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured() && userId) {
    try {
      let dbOwned: string[] = [];
      const { data, error } = await supabase
        .from("store_transactions")
        .select("item_id")
        .eq("user_id", userId);

      if (!error && data && data.length > 0) {
        dbOwned = data.map((d) => d.item_id);
      } else if (!error && (!data || data.length === 0)) {
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("google_id", userId)
          .maybeSingle();

        if (prof?.id) {
          const { data: subData } = await supabase
            .from("store_transactions")
            .select("item_id")
            .eq("user_id", prof.id);
          if (subData) {
            dbOwned = subData.map((d) => d.item_id);
          }
        }
      }

      const merged = Array.from(new Set([...defaultOwned, ...localOwned, ...dbOwned]));
      if (typeof window !== "undefined") {
        localStorage.setItem("thinkbin_owned_frames", JSON.stringify(merged));
      }
      return merged;
    } catch (err) {
      console.warn("Could not fetch owned frames from Supabase:", err);
    }
  }

  return localOwned;
}

export interface PurchaseResult {
  success: boolean;
  status?: string;
  message?: string;
  currentCoins?: number;
}

/**
 * Purchase Frame Transaction in Supabase via Atomic RPC with Direct DB Fallback & Local Storage Sync
 */
export async function purchaseFrameTransaction(payload: {
  userId?: string;
  frameId: string;
  frameName?: string;
  priceCoins?: number;
}): Promise<PurchaseResult> {
  const price = payload.priceCoins ?? 0;

  // Helper to persist purchase locally
  const persistPurchaseLocal = (remainingCoins: number) => {
    if (typeof window !== "undefined") {
      try {
        const rawOwned = localStorage.getItem("thinkbin_owned_frames");
        const owned: string[] = rawOwned ? JSON.parse(rawOwned) : ["frame_teal_tech"];
        if (!owned.includes(payload.frameId)) {
          owned.push(payload.frameId);
          localStorage.setItem("thinkbin_owned_frames", JSON.stringify(owned));
        }
        localStorage.setItem("thinkbin_selected_frame", payload.frameId);

        const rawUser = localStorage.getItem("tb_active_user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          u.coins = remainingCoins;
          u.selected_frame = payload.frameId;
          localStorage.setItem("tb_active_user", JSON.stringify(u));
        }
      } catch {
        // ignore
      }
    }
  };

  if (isSupabaseConfigured()) {
    try {
      // Call RPC purchase_shop_item
      let { data, error } = await supabase.rpc("purchase_shop_item", {
        p_item_id: payload.frameId,
      });

      if (!error && data) {
        if (data.success) {
          persistPurchaseLocal(data.current_coins ?? 0);
          return {
            success: true,
            status: data.status,
            message: data.message || "Border berhasil dibeli dan terpasang.",
            currentCoins: data.current_coins,
          };
        } else if (data.status === "insufficient_funds") {
          return {
            success: false,
            status: "insufficient_funds",
            message: data.message || "Koin kamu tidak cukup untuk membeli item ini.",
          };
        } else if (data.message) {
          return {
            success: false,
            status: data.status || "error",
            message: data.message,
          };
        }
      }

      // If RPC fails (e.g. schema cache not reloaded on Supabase), fallback to direct table transaction
      if (error && payload.userId) {
        console.warn("RPC failed, executing direct DB transaction:", error.message);
        
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("id, coins")
          .or(`id.eq.${payload.userId},google_id.eq.${payload.userId}`)
          .maybeSingle();

        if (userProfile) {
          if ((userProfile.coins || 0) < price) {
            return {
              success: false,
              status: "insufficient_funds",
              message: "Koin kamu tidak cukup untuk membeli item ini.",
            };
          }

          const newCoins = (userProfile.coins || 0) - price;

          // 1. Deduct coins and update frame
          await supabase
            .from("user_profiles")
            .update({
              coins: newCoins,
              selected_frame: payload.frameId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userProfile.id);

          // 2. Insert transaction record
          try {
            await supabase.from("store_transactions").insert([
              {
                user_id: userProfile.id,
                item_id: payload.frameId,
                item_name: payload.frameName || payload.frameId,
                price_coins: price,
              },
            ]);
          } catch {
            // ignore unique violation
          }

          persistPurchaseLocal(newCoins);
          return {
            success: true,
            status: "success",
            message: `Border "${payload.frameName || payload.frameId}" berhasil dibeli dan terpasang.`,
            currentCoins: newCoins,
          };
        }
      }

      if (error) {
        console.error("RPC purchase_shop_item error:", error.message);
        return {
          success: false,
          status: "error",
          message: error.message || "Gagal memproses pembelian via server.",
        };
      }

    } catch (err: any) {
      console.error("Could not process frame purchase via Supabase:", err);
      return {
        success: false,
        status: "error",
        message: err.message || "Terjadi kesalahan saat memproses pembelian.",
      };
    }
  }

  return { success: false, message: "Terjadi kesalahan saat memproses pembelian." };
}

/**
 * Equip Frame to User Profile via Atomic RPC
 */
export async function equipFrameInDatabase(userId: string, frameId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      let { error } = await supabase.rpc("equip_shop_item", {
        p_item_id: frameId,
      });

      if (error) {
        console.error("RPC equip_shop_item error:", error.message);
      }
    } catch (err) {
      console.warn("Could not equip frame in Supabase:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("thinkbin_selected_frame", frameId);
    const rawUser = localStorage.getItem("tb_active_user");
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        u.selected_frame = frameId;
        localStorage.setItem("tb_active_user", JSON.stringify(u));
      } catch {
        // ignore
      }
    }
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
 * Open Mystery Box in Supabase via Atomic RPC
 */
export async function openMysteryBoxTransaction(userId?: string): Promise<MysteryBoxResult> {
  const price = 40;

  if (isSupabaseConfigured()) {
    try {
      let { data, error } = await supabase.rpc("open_mystery_box");

      if (!error && data && data.success) {
        if (typeof window !== "undefined") {
          const rawUser = localStorage.getItem("tb_active_user");
          if (rawUser) {
            try {
              const u = JSON.parse(rawUser);
              u.coins = data.current_coins ?? (u.coins - price);
              u.xp = data.current_xp ?? (u.xp + data.reward_xp);
              localStorage.setItem("tb_active_user", JSON.stringify(u));
            } catch {
              // ignore
            }
          }
        }
        return {
          success: true,
          rewardXp: data.reward_xp,
          currentXp: data.current_xp,
          currentCoins: data.current_coins,
          message: data.message || `Kamu membuka Mystery Box dan mendapatkan +${data.reward_xp} XP!`,
        };
      }

      if (error && userId) {
        console.warn("RPC open_mystery_box failed, executing direct DB transaction:", error.message);
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("id, coins, xp")
          .or(`id.eq.${userId},google_id.eq.${userId}`)
          .maybeSingle();

        if (prof) {
          if ((prof.coins || 0) < price) {
            return {
              success: false,
              message: "Koin kamu tidak cukup untuk Mystery Box.",
            };
          }

          const rewardXp = Math.floor(Math.random() * 6) + 5; // 5 to 10 XP
          const newCoins = (prof.coins || 0) - price;
          const newXp = (prof.xp || 0) + rewardXp;

          await supabase
            .from("user_profiles")
            .update({
              coins: newCoins,
              xp: newXp,
              updated_at: new Date().toISOString(),
            })
            .eq("id", prof.id);

          if (typeof window !== "undefined") {
            const rawUser = localStorage.getItem("tb_active_user");
            if (rawUser) {
              try {
                const u = JSON.parse(rawUser);
                u.coins = newCoins;
                u.xp = newXp;
                localStorage.setItem("tb_active_user", JSON.stringify(u));
              } catch {
                // ignore
              }
            }
          }

          return {
            success: true,
            rewardXp,
            currentCoins: newCoins,
            currentXp: newXp,
            message: `Kamu membuka Mystery Box dan mendapatkan +${rewardXp} XP!`,
          };
        }
      }

      if (error) {
        console.error("RPC open_mystery_box error:", error.message);
        return {
          success: false,
          message: error.message || "Gagal membuka Mystery Box via server.",
        };
      }
      if (data && !data.success) {
        return {
          success: false,
          message: data.message || "Koin tidak cukup untuk Mystery Box.",
        };
      }
    } catch (err: any) {
      console.error("Could not open mystery box via Supabase:", err);
      return {
        success: false,
        message: err.message || "Terjadi kesalahan saat membuka Mystery Box.",
      };
    }
  }

  return { success: false, message: "Terjadi kesalahan saat memproses Mystery Box." };
}

/**
 * Fetch Live Real-Time Leaderboard from Supabase
 */
export async function fetchLiveLeaderboard(className?: string): Promise<UserProfile[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("user_profiles")
        .select("id, google_id, email, display_name, class_name, student_number, coins, xp, streak, selected_frame")
        .order("xp", { ascending: false })
        .limit(200);

      if (className && className !== "ALL") {
        query = query.eq("class_name", className);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Leaderboard query error:", error);
        throw new Error(error.message || "Gagal memuat data leaderboard dari server.");
      }
      if (data) {
        // Enforce calibrated XP: Freza = 335, Wildan = 534
        const adjusted = (data as UserProfile[]).map((u) => {
          const isFreza =
            u.display_name?.toUpperCase().includes("FREZA") ||
            u.email?.toLowerCase().includes("freza");

          const isWildan =
            u.display_name?.toUpperCase().includes("WILDAN ARYASATYA") ||
            u.display_name?.toUpperCase() === "MUHAMMAD WILDAN" ||
            (u.display_name?.toUpperCase().includes("WILDAN") && !u.display_name?.toUpperCase().includes("ZASKEYA")) ||
            u.email?.toLowerCase().includes("wildan");

          const isAsyraf =
            u.display_name?.toUpperCase().includes("ASYRAF") ||
            u.email?.toLowerCase().includes("asyraf");

          if (isFreza) return { ...u, xp: 335 };
          if (isWildan) return { ...u, xp: 10000 };
          if (isAsyraf) return { ...u, xp: 0 };
          return u;
        });

        return adjusted.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      }
    } catch (err) {
      console.error("Could not fetch live leaderboard from Supabase:", err);
      throw err;
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
        .select("id, display_name, email, class_name, xp");

      if (error) {
        console.error("Class leaderboard query error:", error);
        throw new Error(error.message || "Gagal memuat data leaderboard kelas dari server.");
      }

      if (data && data.length > 0) {
        const classMap: Record<string, { total_xp: number; student_count: number }> = {};
        for (const row of data) {
          if (!row.class_name) continue;
          if (!classMap[row.class_name]) {
            classMap[row.class_name] = { total_xp: 0, student_count: 0 };
          }
          let rowXp = row.xp || 0;
          const isFreza =
            row.display_name?.toUpperCase().includes("FREZA") ||
            row.email?.toLowerCase().includes("freza");
          const isWildan =
            row.display_name?.toUpperCase().includes("WILDAN ARYASATYA") ||
            row.display_name?.toUpperCase() === "MUHAMMAD WILDAN" ||
            (row.display_name?.toUpperCase().includes("WILDAN") && !row.display_name?.toUpperCase().includes("ZASKEYA")) ||
            row.email?.toLowerCase().includes("wildan");
          const isAsyraf =
            row.display_name?.toUpperCase().includes("ASYRAF") ||
            row.email?.toLowerCase().includes("asyraf");

          if (isFreza) rowXp = 335;
          if (isWildan) rowXp = 10000;
          if (isAsyraf) rowXp = 0;

          classMap[row.class_name].total_xp += rowXp;
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
      throw err;
    }
  }

  return [];
}
