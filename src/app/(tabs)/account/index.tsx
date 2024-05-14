import {StyleSheet, View, Text, Image, Animated, Pressable, TouchableOpacity} from 'react-native';
import React, {useState} from "react";
import {useAuth} from "@/src/providers/AuthProvider";
import {SafeAreaView} from "react-native-safe-area-context";
import {Link, useNavigation} from "expo-router";
import {Feather} from "@expo/vector-icons";
import {useProfile} from "@/src/api/profiles";
import {ActivityIndicator} from "react-native-paper";

const Card = ({iconName, title, page}) => {
  return (
    <Link href={`/(tabs)/account/${page}`} asChild>
      <Pressable style={styles.cardContainer}>
        <View/>
        <Feather name={iconName} size={24} color="black"/>
        <Text style={styles.cardText}>{title}</Text>
      </Pressable>
    </Link>
  );
};

const AccountScreen = () => {
  const {session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id)

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    return <Text>Failed to fetch data</Text>;
  }

  const [scrollY] = useState(new Animated.Value(0));
  const headerHeight = 80;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, {opacity: headerOpacity, transform: [{translateY: headerTranslateY}]}]}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather name={"arrow-left"} style={styles.back} color={'white'} />
        </TouchableOpacity>
        <Image
          source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
        <View>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>
      </Animated.View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Card iconName={"folder"} page={'profile'} title={"Profile"}/>
          <Card iconName={"pie-chart"} page={'spending'} title={"Spending"}/>
          <Card iconName={"settings"} page={'settings'} title={"Settings"}/>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  body: {
    backgroundColor: 'white',
    flex: 1,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
  },
  header: {
    height: 180,
    backgroundColor: 'black',
    zIndex: 1,
    flexDirection: "row",
    gap: 16,
    paddingVertical: 70,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#eee',
  },
  imageSelector: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  name: {
    fontSize: 32,
    fontWeight: '500',
    color: 'white',
  },
  email: {
    fontSize: 16,
    fontWeight: '300',
    color: 'white',
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  cardContainer: {
    height: 100,
    width: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#eee',
    alignItems: "center",
    backgroundColor: "white",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  back: {
    fontSize: 30,
  }
});
