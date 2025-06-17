import {View} from "react-native";
import {Text} from "react-native-paper";
import React from "react";
import {MaterialIcons} from "@expo/vector-icons";

export const TransferItem = ({transfer, members, currentUserId}) => {
  // Find sender and receiver member details
  const senderMember = members?.find(member =>
    member.profile?.id === transfer.sender || member.id === transfer.sender
  );
  const receiverMember = members?.find(member =>
    member.profile?.id === transfer.receiver || member.id === transfer.receiver
  );

  const getSenderName = () => {
    if (senderMember?.profile?.email) {
      return senderMember.profile.email.split('@')[0];
    }
    return senderMember?.name || 'Unknown';
  };

  const getReceiverName = () => {
    if (receiverMember?.profile?.email) {
      return receiverMember.profile.email.split('@')[0];
    }
    return receiverMember?.name || 'Unknown';
  };

  const isCurrentUserSender = transfer.sender === currentUserId;
  const isCurrentUserReceiver = transfer.receiver === currentUserId;

  return (
    <View className="bg-white py-3 px-1 pr-4 rounded-lg gap-x-4 items-center mx-1 flex flex-row justify-between mb-2"
    >
      {/* Money Icon */}
      <View
        style={{backgroundColor: '#2563eb'}}
        className="justify-center items-center h-12 w-12 rounded-lg p-2"
      >
        <MaterialIcons
          name={'attach-money'}
          color={'white'}
          size={25}
        />
      </View>

      {/* Sender -> Receiver with Arrow */}
      <View className="flex-1 mx-4">
        <View className="flex-row items-center">
          <Text
            variant="titleMedium"
            numberOfLines={1}
            className={`${isCurrentUserSender ? 'text-red-600 font-bold' : 'text-gray-700'}`}
          >
            {getSenderName()}
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={16}
            color="#6b7280"
            style={{marginHorizontal: 8}}
          />
          <Text
            variant="titleMedium"
            numberOfLines={1}
            className={`${isCurrentUserReceiver ? 'text-green-600 font-bold' : 'text-gray-700'}`}
          >
            {getReceiverName()}
          </Text>
        </View>
        {transfer.description && (
          <Text variant="bodySmall" className="text-gray-500 mt-1" numberOfLines={1}>
            {transfer.description}
          </Text>
        )}
      </View>

      {/* Amount */}
      <View>
        <Text variant="titleSmall" className="text-right">
          €{transfer.amount?.toFixed(2)}
        </Text>
        {transfer?.settled && (
          <Text variant={"titleSmall"} className={"text-green-500"}>
            settled
          </Text>
        )}
      </View>
    </View>
  );
};
