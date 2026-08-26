"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { supabase, signInWithGoogleOAuth, fetchUserProfile, saveUserProfile } from "@/lib/supabase";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => {},
  updateUser: () => {},
  refreshProfile: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user?.id) return;
    const latest = await fetchUserProfile(user.id);
    if (latest) {
      setUser(latest);
      localStorage.setItem("tb_active_user", JSON.stringify(latest));
    }
  };

  useEffect(() => {
    let initialUser: UserProfile | null = null;
    try {
      const savedUser = localStorage.getItem("tb_active_user");
      if (savedUser) {
        initialUser = JSON.parse(savedUser);
        setUser(initialUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }

    // Listen to Supabase Auth state changes
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const googleId = session.user.id;
            const email = session.user.email || "";

            try {
              // Query existing profile from user_profiles table
              const { data: profile } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("google_id", googleId)
                .maybeSingle();

              if (profile) {
                const merged: UserProfile = {
                  ...(profile as UserProfile),
                  onboarding_completed: profile.onboarding_completed ?? true,
                };
                setUser(merged);
                localStorage.setItem("tb_active_user", JSON.stringify(merged));
              } else {
                // If profile not yet in Supabase table
                setUser((prev) => {
                  // If local session already completed onboarding, preserve it & sync
                  if (prev && (prev.onboarding_completed || prev.class_name)) {
                    const preserved: UserProfile = {
                      ...prev,
                      google_id: googleId,
                      email: email || prev.email,
                      onboarding_completed: true,
                    };
                    localStorage.setItem("tb_active_user", JSON.stringify(preserved));
                    saveUserProfile(preserved).catch(() => {});
                    return preserved;
                  }

                  // Brand new user before profile setup
                  const newUser: UserProfile = {
                    id: "usr_" + googleId.substring(0, 8),
                    google_id: googleId,
                    email: email,
                    display_name: session.user.user_metadata?.full_name || "",
                    class_name: "",
                    student_number: 0,
                    coins: 0,
                    xp: 0,
                    streak: 1,
                    onboarding_completed: false,
                  };
                  localStorage.setItem("tb_active_user", JSON.stringify(newUser));
                  return newUser;
                });
              }
            } catch (err) {
              console.warn("Supabase onAuthStateChange error, retaining local state:", err);
            }
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const loginWithGoogle = async () => {
    await signInWithGoogleOAuth();
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("tb_active_user", JSON.stringify(updated));
      
      // Auto-sync updates to Supabase
      if (updated.id && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabase
          .from("user_profiles")
          .upsert([
            {
              id: updated.id,
              google_id: updated.google_id,
              email: updated.email,
              display_name: updated.display_name,
              class_name: updated.class_name,
              student_number: updated.student_number,
              coins: updated.coins,
              xp: updated.xp,
              streak: updated.streak,
              selected_frame: updated.selected_frame,
              onboarding_completed: updated.onboarding_completed,
            },
          ], { onConflict: "id" })
          .then(() => {}, (err) => console.warn("Supabase background sync error:", err));
      }

      return updated;
    });
  };

  const logout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Sign out warning:", e);
    }
    localStorage.removeItem("tb_active_user");
    localStorage.removeItem("thinkbin_completed_nodes");
    localStorage.removeItem("thinkbin_unlocked_node");
    localStorage.removeItem("thinkbin_selected_frame");
    localStorage.removeItem("thinkbin_owned_frames");
    localStorage.removeItem("thinkbin_xp");
    localStorage.removeItem("thinkbin_coins");
    localStorage.removeItem("thinkbin_komitmen");
    localStorage.removeItem("thinkbin_claimed_missions");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        updateUser,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
