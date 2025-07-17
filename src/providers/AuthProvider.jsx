import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Session } from "@supabase/auth-js";

const AuthContext = createContext({
  session: null,
  loading: true,
});

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Function to update session in context
  const updateSession = (newSession) => {
    setSession(newSession);
  };

  return (
    <AuthContext.Provider value={{ session, loading, setSession: updateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
