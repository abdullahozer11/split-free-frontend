import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/src/lib/supabase";
import { Session } from "@supabase/auth-js";

type AuthData = {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  setSession: () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      setSession(session);
      setLoading(false);
    };

    fetchSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) {
        return;
      }
      setSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Function to update session in context
  const updateSession = (newSession: Session | null) => {
    setSession(newSession);
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, setSession: updateSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
