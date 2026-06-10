import { useState, useEffect, createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  enterAsGuest: () => void;
};

const guestUser: User = {
  id: "guest-user-id",
  app_metadata: {},
  user_metadata: { full_name: "Guest Advocate" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "guest@nyastra.ai",
};

const guestSession: Session = {
  access_token: "guest-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "guest-refresh-token",
  user: guestUser,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  enterAsGuest: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest mode is enabled
    if (localStorage.getItem("nyastra_guest_mode") === "true") {
      setSession(guestSession);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (localStorage.getItem("nyastra_guest_mode") !== "true") {
          setSession(session);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (localStorage.getItem("nyastra_guest_mode") !== "true") {
        setSession(session);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("nyastra_guest_mode");
    setSession(null);
    await supabase.auth.signOut();
  };

  const enterAsGuest = () => {
    localStorage.setItem("nyastra_guest_mode", "true");
    setSession(guestSession);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut, enterAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
