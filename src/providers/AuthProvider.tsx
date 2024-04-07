import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {supabase} from "@/src/lib/supabase";
import {Session} from "@supabase/auth-js";

type AuthData = {
  session: Session | null;
  profile: any;
  loading: boolean;
};

const AuthContext = createContext<AuthData>({
  session: null,
  profile: null,
  loading: true,
});

export default function AuthProvider({children}: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState(null); // put Profile type
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {data: {session}} = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const {data} = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data || null);
      }

      setLoading(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  }, [])

  return <AuthContext.Provider value={{session, profile, loading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
