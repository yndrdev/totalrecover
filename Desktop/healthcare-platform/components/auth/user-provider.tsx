"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Database } from "@/lib/database-types";

type UserRecord = Database['public']['Tables']['profiles']['Row'];

interface UserContextType {
  user: User | null;
  userRecord: UserRecord | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserRecord: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userRecord: null,
  loading: true,
  signOut: async () => {},
  refreshUserRecord: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserRecord = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data as UserRecord;
    } catch (error) {
      console.error("Error in fetchUserRecord:", error);
      return null;
    }
  };

  const refreshUserRecord = async () => {
    if (user) {
      const newUserRecord = await fetchUserRecord(user.id);
      setUserRecord(newUserRecord);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRecord(null);
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          const userRecord = await fetchUserRecord(user.id);
          setUserRecord(userRecord);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const userRecord = await fetchUserRecord(session.user.id);
          setUserRecord(userRecord);
        } else {
          setUser(null);
          setUserRecord(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <UserContext.Provider value={{ user: null, userRecord: null, loading: true, signOut, refreshUserRecord }}>
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{ user, userRecord, loading, signOut, refreshUserRecord }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};