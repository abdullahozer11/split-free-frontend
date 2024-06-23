import {View, ScrollView, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import {Friend, NotifLine, SearchProfile} from "@/src/components/Person";
import {
  Text,
  ActivityIndicator,
  ProgressBar,
  Searchbar,
  Dialog,
  Button,
  Portal,
} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {
  getFriendRequests,
  getFriends,
  useAcceptFriend, useDeleteFriendRequest,
  useInsertFriendRequest,
  useProfile, useRejectFriend,
  useUnfriend
} from "@/src/api/profiles";
import {useAuth} from "@/src/providers/AuthProvider";
import {supabase} from "@/src/lib/supabase";
import {useQueryClient} from "@tanstack/react-query";
import {useFriendRequestSubscription} from "@/src/api/profiles/subscriptions";


export default function FriendScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isNotifMenuVisible, setIsNotifMenuVisible] = useState(false);
  const [removingFriend, setRemovingFriend] = useState({email: null, id: null});

  const {session} = useAuth();
  const {data: profile, isLoading: profileLoading, isError: profileError} = useProfile(session?.user.id);
  const {data: friends, isError, isLoading} = getFriends(session?.user.id);
  const {data: freqs, isError: freqError, isLoading: freqIsLoading} = getFriendRequests(session?.user.id);
  const {mutate: insertFriendRequest} = useInsertFriendRequest();
  const {mutate: deleteFriendRequest} = useDeleteFriendRequest();
  const {mutate: unfriend} = useUnfriend();
  const {mutate: acceptFriend} = useAcceptFriend();
  const {mutate: rejectFriend} = useRejectFriend();

  useFriendRequestSubscription(session?.user.id);

  if (isLoading || profileLoading || freqIsLoading) {
    return <ActivityIndicator/>;
  }

  if (isError || profileError || freqError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleSearch = async () => {
    setSearchLoading(true);
    const {data, error} = await supabase
      .rpc('search_friends', {
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
    insertFriendRequest({
      sender_id: session?.user.id,
      receiver_id: friend_id_input,
    }, {
      onSuccess: async () => {
        console.log("Friend request is created.")
        const newSearchResults = searchResults;
        newSearchResults.find((sr) => sr.id == friend_id_input).friend_status = "SENT";
        setSearchResults(newSearchResults);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  const handleCancelFriendReq = (receiver_id) => {
    deleteFriendRequest({
      sender: session?.user.id,
      receiver: receiver_id
  }, {
      onSuccess: async () => {
        console.log("Friend request is deleted.")
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };


  const handleRemove = (friend_id) => {
    // console.log("Removing friend", friend_id);
    unfriend(friend_id, {
      onSuccess: async () => {
        // console.log("Successfully unfriended", friend_id);
        setIsDialogVisible(false);
        await queryClient.invalidateQueries(['friends']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  const handleAccept = async (sender_uid) => {
    acceptFriend(sender_uid, {
      onSuccess: async () => {
        console.log('Friend request is accepted');
        setIsNotifMenuVisible(false);
        await queryClient.invalidateQueries(['friends']);
        await queryClient.invalidateQueries(['friend_requests']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  const handleIgnore = (sender_uid) => {
    rejectFriend(sender_uid, {
      onSuccess: async () => {
        console.log('Friend request is rejected');
        setIsNotifMenuVisible(false);
        await queryClient.invalidateQueries(['friends']);
        await queryClient.invalidateQueries(['friend_requests']);
      },
      onError: (error) => {
        console.error('Server error:', error);
        Alert.alert('Error', 'Server error.');
      },
    });
  };

  return (
    <>
      <SafeAreaView style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity onPress={() => {
          setIsNotifMenuVisible(!isNotifMenuVisible);
        }} disabled={!freqs?.length} asChild>
          <Feather style={styles.notifIcon} name={"bell"} size={36}/>
          {!!freqs?.length && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{freqs?.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
      <View style={styles.body}>
        {isNotifMenuVisible && <View style={styles.notifications}>
          {freqs.map((freq) => (
            <NotifLine key={freq.id} email={freq.sender_profile.email} onAccept={() => handleAccept(freq.sender)} onIgnore={() => handleIgnore(freq.sender)}/>
          ))}
        </View>}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            mode={'view'}
            style={{backgroundColor: 'white'}}
            onClearIconPress={() => {
              setSearchQuery(null);
            }}
            onIconPress={handleSearch}
            loading={searchLoading}
          />
          <ScrollView style={{backgroundColor: 'white'}}>
            {searchResults?.map((profile) => (
              profile.id !== session?.user.id && (
                <View key={profile.id}>
                  <SearchProfile onAdd={handleAddFriend} onCancel={handleCancelFriendReq} profile={profile}/>
                </View>
              )
            ))}
            {!!searchResults.length && <View style={{flex: 1, alignItems: "center"}}>
              <TouchableOpacity onPress={() => setSearchResults([])}>
                <Feather name={'chevrons-up'} size={24}/>
              </TouchableOpacity>
            </View>}
          </ScrollView>
        </View>
        <View style={styles.balanceSection}>
          <View style={{flexDirection: "row", marginHorizontal: 15}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Receivable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>+ €{profile?.total_receivable?.toFixed(2)}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Payable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold"}}>- €{profile?.total_payable.toFixed(2)}</Text>
            </View>
          </View>
          <ProgressBar animatedValue={0.7} theme={{colors: {primary: 'green'}}} style={{height: 18, borderRadius: 10}}/>
        </View>
        <View>
          <View style={{flexDirection: "row", gap: 5, alignItems: "center"}}>
            <UnderlinedText text={"All Friends"} fontSize={20} fontWeight={"700"}/>
            {/*<Feather style={{fontSize: 20, fontWeight: "500"}} name={"chevron-down"} size={20}/>*/}
          </View>
          <View style={styles.personContainer}>
            {friends?.map(({profile: {id, email, avatar_url}}) => (
              <Friend key={id} email={email} avatar_url={avatar_url} onRemove={() => {
                setRemovingFriend({
                  id,
                  email,
                });
                setIsDialogVisible(true);
              }}/>
            ))}
          </View>
        </View>
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={() => {
            setIsDialogVisible(false);
          }}>
            <Dialog.Icon icon="alert"/>
            <Dialog.Title>Are you sure to unfriend {removingFriend.email}?</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">This action cannot be taken back</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
              <Button onPress={() => handleRemove(removingFriend.id)}>Ok</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F6F6F6FF',
    width: "100%",
    height: 130,
    flexDirection: "row",
    padding: 10,
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconContainer: {
    marginLeft: 16,
    borderRadius: 10,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
  },
  transparent: {
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 40,
  },
  body: {
    padding: 16,
    backgroundColor: '#F6F6F6FF',
    flex: 1,
  },
  balanceSection: {
    marginBottom: 30,
    gap: 15,
  },
  personContainer: {
    gap: 10,
    padding: 10,
  },
  searchBox: {
    backgroundColor: "white",
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  searchSection: {
    marginBottom: 20,
  },
  notifIcon: {
    marginRight: 10,
  },
  notifications: {
    backgroundColor: "white",
    position: "absolute",
    top: -10,
    zIndex: 999,
    right: 30,
    borderWidth: 1,
    borderRadius: 10,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
