import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import {Text, Button, DialogTitle} from "@/src/components/Translated";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import { Friend, NotifLine, SearchProfile } from "@/src/components/Person";
import {
  ActivityIndicator,
  Searchbar,
  Dialog,
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
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";

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
  const {settings} = useSettings();
  const int = translations[settings.language] || translations.en;

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

    const userId = session?.user.id;

    // Fetch matching profiles
    const {data: profiles, error: profilesError} = await supabase
      .from("profiles")
      .select("id, email, avatar_url")
      .ilike("email", `${searchQuery}%`)
      .order("email")
      .limit(6)
      .range(0, 5);  // offset 0, limit 6

    if (profilesError) {
      console.log("Handle Search profiles error is ", profilesError.message);
      setSearchLoading(false);
      return;
    }

    if (profiles.length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const profileIds = profiles.map(p => p.id);

    // Fetch user's friends
    const {data: friendsData, error: friendsError} = await supabase
      .from("friends")
      .select("friend")
      .eq("profile", userId);

    if (friendsError) {
      console.log("Handle Search friends error is ", friendsError.message);
      setSearchLoading(false);
      return;
    }

    const friendIds = friendsData ? friendsData.map(f => f.friend) : [];

    // Fetch sent requests (receivers)
    const {data: sentData, error: sentError} = await supabase
      .from("friend_requests")
      .select("receiver")
      .eq("sender", userId);

    if (sentError) {
      console.log("Handle Search sent error is ", sentError.message);
      setSearchLoading(false);
      return;
    }

    const sentIds = sentData ? sentData.map(s => s.receiver) : [];

    // Fetch received requests (senders)
    const {data: receivedData, error: receivedError} = await supabase
      .from("friend_requests")
      .select("sender")
      .eq("receiver", userId);

    if (receivedError) {
      console.log("Handle Search received error is ", receivedError.message);
      setSearchLoading(false);
      return;
    }

    const receivedIds = receivedData ? receivedData.map(r => r.sender) : [];

    // Compute statuses
    const results = profiles.map(p => ({
      id: p.id,
      email: p.email,
      avatar_url: p.avatar_url,
      friend_status: friendIds.includes(p.id) ? 'FRIEND' :
        sentIds.includes(p.id) ? 'SENT' :
          receivedIds.includes(p.id) ? 'RECEIVED' : 'AVAILABLE'
    }));

    setSearchResults(results);
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
            placeholder={int["Search"] || "Search"}
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
              <Text className={"text-2xl"}>Total Receivable</Text>
              <Text className={"text-2xl font-bold text-green-700"}>
                + €{profile?.total_receivable?.toFixed(2)}
              </Text>
            </View>
            <View className={"items-end"}>
              <Text className={"text-2xl"}>Total Payable</Text>
              <Text className={"text-2xl font-bold"}>
                - €{Math.abs(profile?.total_payable.toFixed(2))}
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
            <DialogTitle>
              <Text>
                Are you sure to unfriend
              </Text>
              <Text>
                {" " + removingFriend.email}?
              </Text>
            </DialogTitle>
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
