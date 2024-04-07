import {Stack} from 'expo-router';
import {useAuth} from "@/src/providers/AuthProvider";
import {Redirect} from 'expo-router';

export default function AuthLayout() {
  const {session} = useAuth();

  if (session) {
    return <Redirect href={'/'}/>
  }

  return <Stack />;
}
