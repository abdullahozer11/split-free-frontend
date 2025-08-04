import { View, SafeAreaView } from "react-native";
import { Text } from "@/src/components/Translated";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import { useTransfer } from "@/src/api/transfers";
import { ActivityIndicator } from "react-native-paper";
import { formatDateString } from "@/src/utils/helpers";
import { useSettings } from "@/src/providers/SettingsProvider.js";

const TransferDetails = ({ sender, receiver, amount, created_at, lang }) => {
  return (
    <View className="bg-white rounded-[10px] p-4 m-4">
      <Text variant="labelLarge" className="underline">
        Transfer Details
      </Text>
      <View className="mt-2">
        <View className="flex-row justify-between">
          <Text variant="bodyLarge">From:</Text>
          <Text variant="bodyLarge">{sender}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text variant="bodyLarge">To:</Text>
          <Text variant="bodyLarge">{receiver}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text variant="bodyLarge">Amount:</Text>
          <Text variant="bodyLarge">{amount}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text variant="bodyLarge">Date:</Text>
          <Text variant="bodyLarge">{formatDateString(created_at, lang)}</Text>
        </View>
      </View>
    </View>
  );
};

const TransferDetailsScreen = () => {
  const { group_id: groupIdString, transfer_id: transferIdString } =
    useLocalSearchParams();
  const id = parseInt(
    typeof transferIdString === "string" ? transferIdString : transferIdString[0]
  );
  const { settings } = useSettings();

  const {
    data: transfer,
    isError: isTransferError,
    isLoading: transferLoading,
  } = useTransfer(id);

  if (transferLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isTransferError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text variant="displayLarge">Failed to fetch transfer data</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <CollapsableHeader
        H_MAX_HEIGHT={200}
        H_MIN_HEIGHT={52}
        content={
          <View className="flex-1 p-5">
            <Text variant="headlineLarge">Transfer</Text>
            <TransferDetails
              sender={transfer?.sender}
              receiver={transfer?.receiver}
              amount={transfer?.amount}
              created_at={transfer?.created_at}
              lang={settings.language}
            />
          </View>
        }
        headerContent={
          <View className="justify-center items-center flex-1">
            <View className="justify-between items-center">
              <Text
                variant="displaySmall"
                className="text-white mb-2 max-w-[70%]"
              >
                {`${transfer?.sender} to ${transfer?.receiver}`}
              </Text>
              <Text className="text-sm font-200 text-white">
                Transferred on
              </Text>
              <Text className="text-sm font-200 text-white">
                {transfer && formatDateString(transfer.created_at, settings.language)}
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default TransferDetailsScreen;
