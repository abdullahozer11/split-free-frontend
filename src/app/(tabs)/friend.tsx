import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from "react";
import {Feather} from "@expo/vector-icons";
import UnderlinedText from "@/src/components/UnderlinedText";
import {Friend, SearchProfile} from "@/src/components/Person";
import {Text, ActivityIndicator, ProgressBar, Searchbar, Dialog, Button, Portal} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {supabase} from "@/src/lib/supabase";
import {getFriends, useInsertFriendRequest, useProfile, useUnfriend} from "@/src/api/profiles";
import {useAuth} from "@/src/providers/AuthProvider";


export default function FriendScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [removingFriend, setRemovingFriend] = useState({});

  const {session} = useAuth();
  const {data: profile, isLoading: profileLoading, isError: profileError} = useProfile(session?.user.id)
  const {data: friends, error, isLoading} = getFriends(session?.user.id);
  const {mutate: insertFriendRequest} = useInsertFriendRequest();
  const {mutate: unfriend} = useUnfriend();

  if (isLoading || profileLoading) {
    return <ActivityIndicator/>;
  }

  if (error || profileError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleSearch = async () => {
    setSearchLoading(true);
    const {data, error} = await supabase
      .rpc('search_friends', {
        keyword_input: searchQuery,
        profile_id_input: session?.user.id,
        limit_input: 10,
        offset_input: 0,
      });
    if (error) {
      console.log("error iss ", error.message);
      setSearchLoading(false);
      return;
    }
    setSearchResults(data);
    setSearchLoading(false);
  };

  const handleAddFriend = (friend_id_input) => {
    console.log("Creating friend request");
    insertFriendRequest({
      sender_id: session?.user.id,
      receiver_id: friend_id_input,
    });
  };

  const handleRemove = (friend_id) => {
    console.log("Removing friend", friend_id);
    unfriend(friend_id, {
      onSuccess: () => {
        console.log("Successfully unfriended", friend_id);
        setIsDialogVisible(false);
      }
    })
  };

  return (
    <>
      <SafeAreaView style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity onPress={() => {
          console.log("notifications")
        }} asChild>
          <Feather style={styles.notifIcon} name={"bell"} size={36}/>
        </TouchableOpacity>
      </SafeAreaView>
      <View style={styles.body}>
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
                  <SearchProfile onAdd={handleAddFriend} profile={profile}/>
                </View>
              )
            ))}
          </ScrollView>
        </View>
        <View style={styles.balanceSection}>
          <View style={{flexDirection: "row", marginHorizontal: 15}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Receivable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold", color: "green"}}>+ €{profile?.total_receivable}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18}}>Total Payable:</Text>
              <Text style={{fontSize: 24, fontWeight: "bold"}}>- €{profile?.total_payable}</Text>
            </View>
          </View>
          <ProgressBar animatedValue={0.7} theme={{colors: {primary: 'green'}}} style={{height: 18, borderRadius: 10}}/>
        </View>
        <View>
          <View style={{flexDirection: "row", gap: 5, alignItems: "center"}}>
            <UnderlinedText text={"All Friends"} fontSize={20} fontWeight={"700"}/>
            <Feather style={{fontSize: 20, fontWeight: "500"}} name={"chevron-down"} size={20}/>
          </View>
          <View style={styles.personContainer}>
            {friends?.map((friend) => (
              <Friend key={friend.id} profile={friend} onRemove={() => {
                setRemovingFriend({
                  id: friend.id,
                  email: friend.email,
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
          <Dialog.Title>Are you sure to unfriend {removingFriend?.email}?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be taken back</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => handleRemove(removingFriend?.id)}>Ok</Button>
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
  }
});
