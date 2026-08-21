import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Button, Text } from "@/src/components/Translated";

type FetchErrorProps = {
  message: string;
  onRetry: () => void;
};

export default function FetchError({ message, onRetry }: FetchErrorProps) {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text>{message}</Text>
      <Button onPress={onRetry}>Retry</Button>
    </View>
  );
}

type ProfileQueryFallbackArgs = {
  uid: string;
  isLoading: boolean;
  isError: boolean;
  profile: unknown;
  refetch: () => unknown;
};

/** Loading, network error, or missing profile row. Null means the query succeeded. */
export function profileQueryFallback({
  uid,
  isLoading,
  isError,
  profile,
  refetch,
}: ProfileQueryFallbackArgs) {
  if (!uid || isLoading) {
    return <ActivityIndicator />;
  }
  if (isError) {
    return (
      <FetchError
        message="Failed to fetch data"
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }
  if (!profile) {
    return (
      <FetchError
        message="Profile not found"
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }
  return null;
}
