import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import { Friend, NotifLine, SearchProfile } from "@/src/components/Person";
import {
  Text,
  ActivityIndicator,
  Searchbar,
  Dialog,
  Button,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFriendRequests,
  useFriends,
  useAcceptFriend,
  useDeleteFriendRequest,
  useInsertFriendRequest,
  useProfile,
  useRejectFriend,
  useUnfriend,
} from "@/src/api/profiles";
import { useAuth } from "@/src/providers/AuthProvider";
import { supabase } from "@/src/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useFriendRequestSubscription } from "@/src/api/profiles/subscriptions";

export default function FriendScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isNotifMenuVisible, setIsNotifMenuVisible] = useState(false);
  const [removingFriend, setRemovingFriend] = useState({
    email: null,
    id: null,
  });

  const { setSession, session } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile(session?.user.id);
  const { data: friends, isError, isLoading } = useFriends(session?.user.id);
  const {
    data: freqs,
    isError: freqError,
    isLoading: freqIsLoading,
  } = useFriendRequests(session?.user.id);
  const { mutate: insertFriendRequest } = useInsertFriendRequest();
  const { mutate: deleteFriendRequest } = useDeleteFriendRequest();
  const { mutate: unfriend } = useUnfriend();
  const { mutate: acceptFriend } = useAcceptFriend();
  const { mutate: rejectFriend } = useRejectFriend();

  useFriendRequestSubscription(session?.user.id);

  if (isLoading || profileLoading || freqIsLoading) {
    return <ActivityIndicator />;
  }

  if (profileError) {
    setSession(null);
    return <Text>Failed to fetch data</Text>;
  }

  if (isError || freqError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleSearch = async () => {
    setSearchLoading(true);
    const { data, error } = await supabase.rpc("search_friends", {
      keyword_input: searchQuery,
      profile_id_input: session?.user.id,
      limit_input: 6,
      offset_input: 0,
    });
    if (error) {
      console.log("Handle Search error is ", error.message);
      setSearchLoading(false);
      return;
    }
    setSearchResults(data);
    setSearchLoading(false);
  };

  const handleAddFriend = (friend_id_input) => {
    insertFriendRequest(
      {
        sender_id: session?.user.id,
        receiver_id: friend_id_input,
      },
      {
        onSuccess: async () => {
          console.log("Friend request is created.");
          const newSearchResults = searchResults;
          newSearchResults.find(
            (sr) => sr.id === friend_id_input,
          ).friend_status = "SENT";
          setSearchResults(newSearchResults);
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleCancelFriendReq = (receiver_id) => {
    deleteFriendRequest(
      {
        sender: session?.user.id,
        receiver: receiver_id,
      },
      {
        onSuccess: async () => {
          console.log("Friend request is deleted.");
        },
        onError: (error) => {
          console.error("Server error:", error);
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleRemove = (friend_id) => {
    // console.log("Removing friend", friend_id);
    unfriend(friend_id, {
      onSuccess: async () => {
        // console.log("Successfully unfriended", friend_id);
        setIsDialogVisible(false);
        await queryClient.invalidateQueries(["friends"]);
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  const handleAccept = async (sender_uid) => {
    acceptFriend(sender_uid, {
      onSuccess: async () => {
        console.log("Friend request is accepted");
        setIsNotifMenuVisible(false);
        await queryClient.invalidateQueries(["friends"]);
        await queryClient.invalidateQueries(["friend_requests"]);
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  const handleIgnore = (sender_uid) => {
    rejectFriend(sender_uid, {
      onSuccess: async () => {
        console.log("Friend request is rejected");
        setIsNotifMenuVisible(false);
        await queryClient.invalidateQueries(["friends"]);
        await queryClient.invalidateQueries(["friend_requests"]);
      },
      onError: (error) => {
        console.error("Server error:", error);
        Alert.alert("Error", "Server error.");
      },
    });
  };

  return (
    <>
      <SafeAreaView
        className={"flex-row justify-between items-end bg-gray-100 p-4"}
      >
        <Text className={"text-5xl"}>Friends</Text>
        <TouchableOpacity
          onPress={() => {
            setIsNotifMenuVisible(!isNotifMenuVisible);
          }}
          disabled={!freqs?.length}
          asChild
        >
          <Feather name={"bell"} size={36} />
          {!!freqs?.length && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
              <Text className="text-white text-xs">{freqs?.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
      <View className="p-4 bg-gray-100 h-screen">
        {isNotifMenuVisible && !!freqs.length && (
          <View className="absolute top-0 right-0 bg-white border rounded-lg border-gray-400 p-2 mr-2 z-10">
            {freqs.map((freq) => (
              <NotifLine
                key={freq.id}
                email={freq.sender_profile.email}
                onAccept={() => handleAccept(freq.sender)}
                onIgnore={() => handleIgnore(freq.sender)}
              />
            ))}
          </View>
        )}
        <View className="mb-4">
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            mode="view"
            className="bg-white"
            onClearIconPress={() => setSearchQuery(null)}
            onIconPress={handleSearch}
            loading={searchLoading}
          />
          <ScrollView className={"bg-white"}>
            {searchResults?.map(
              (profile) =>
                profile.id !== session?.user.id && (
                  <View key={profile.id}>
                    <SearchProfile
                      onAdd={handleAddFriend}
                      onCancel={handleCancelFriendReq}
                      profile={profile}
                    />
                  </View>
                ),
            )}
            {!!searchResults.length && (
              <View className="flex-1 items-center">
                <TouchableOpacity onPress={() => setSearchResults([])}>
                  <Feather name={"chevrons-up"} size={24} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
        <View>
          <View className={"m-15 flex-row justify-between mr-5"}>
            <View className={"items-end"}>
              <Text className={"text-xl"}>Total Receivable:</Text>
              <Text className={"text-xl font-bold text-green-700"}>
                + €{profile?.total_receivable?.toFixed(2)}
              </Text>
            </View>
            <View className={"items-end"}>
              <Text className={"text-xl"}>Total Payable:</Text>
              <Text className={"text-xl font-bold"}>
                - €{profile?.total_payable.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View className="mb-4">
          <View className="flex-row gap-1 mt-5">
            <UnderlinedText text="All Friends" fontSize={32} fontWeight="700" />
          </View>
          <View className="p-4 gap-4">
            {friends?.map(({ profile: { id, email, avatar_url } }) => (
              <Friend
                key={id}
                email={email}
                avatar_url={avatar_url}
                onRemove={() => {
                  setRemovingFriend({
                    id,
                    email,
                  });
                  setIsDialogVisible(true);
                }}
              />
            ))}
          </View>
        </View>
        <Portal>
          <Dialog
            visible={isDialogVisible}
            onDismiss={() => {
              setIsDialogVisible(false);
            }}
          >
            <Dialog.Icon icon="alert" />
            <Dialog.Title>
              Are you sure to unfriend {removingFriend.email}?
            </Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">This action cannot be taken back</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
              <Button onPress={() => handleRemove(removingFriend.id)}>
                Ok
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </>
  );
}
