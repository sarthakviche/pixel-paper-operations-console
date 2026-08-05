"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/domain.types";
import { createClient } from "@/lib/supabase/client";

interface UserContextValue {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isManager: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  profile: null,
  role: null,
  isManager: false,
  isLoading: true,
});

/**
 * UserContextProvider — wraps the app and provides auth + role data.
 * Role is fetched ONCE on mount. Never refetch on navigation.
 * Access via useUser() hook in any Client Component.
 */
export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial session check
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        if (data) setProfile(data as Profile);
      }
      setIsLoading(false);
    };

    init();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) setProfile(data as Profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const role = profile?.role ?? null;
  const isManager = role === "admin" || role === "manager";

  return (
    <UserContext.Provider value={{ user, profile, role, isManager, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access the current user, profile, and role.
 * Must be used inside a Client Component that is a descendant of UserContextProvider.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}
