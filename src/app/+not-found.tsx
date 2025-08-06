import { Link } from "expo-router";
import { View } from "react-native";
import { Text } from "@/src/components/Translated";
import { Stack } from "expo-router";
import { useTranslations } from "@/src/components/Translated";


export default function NotFoundScreen() {
  const {t} = useTranslations();
  return (
    <>
      <Stack.Screen options={{ title: t("Oops!") }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-2xl font-bold">This screen does not exist.</Text>

        <Link href="/" className="mt-4 py-3">
          <Text className="text-blue-600">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
