import {StyleSheet, View, Text, Image, Animated, Pressable} from 'react-native';
import React, {useState} from "react";
import {useAuth} from "@/src/providers/AuthProvider";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import {Link} from "expo-router";

const Card = ({iconName, title, page}) => {
  return (
    <Link href={`/(tabs)/Account/${page}`} asChild>
      <Pressable style={styles.cardContainer}>
        <View/>
        <Ionicons name={iconName} size={24} color="black"/>
        <Text style={styles.cardText}>{title}</Text>
      </Pressable>
    </Link>
  );
};

const AccountScreen = () => {
  const {profile} = useAuth();
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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, {opacity: headerOpacity, transform: [{translateY: headerTranslateY}]}]}>
        <Image
          source={profile?.avatar_url ? {uri: profile.avatar_url} : require('@/assets/images/blank-profile.png')}
          style={styles.avatar}/>
        <View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@gmail.com</Text>
        </View>
      </Animated.View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Card iconName={"close"} page={'profile'} title={"Profile"}/>
          <Card iconName={"close"} page={'spending'} title={"Spending"}/>
          <Card iconName={"close"} page={'settings'} title={"Settings"}/>
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
});
