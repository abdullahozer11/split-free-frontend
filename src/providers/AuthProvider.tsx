import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {supabase} from "@/src/lib/supabase";
import {Session} from "@supabase/auth-js";

type AuthData = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
});

export default function AuthProvider({children}: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {data: {session}} = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Function to update session in context
  const updateSession = (newSession: Session | null) => {
    setSession(newSession);
  };

  return <AuthContext.Provider value={{session, loading, setSession: updateSession}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
