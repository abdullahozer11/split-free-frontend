import React, { useState } from 'react';
import {FlatList, Text, View, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import ActivityItem from '@/src/components/ActivityItem';
import { activity } from '@/assets/data/activity';
import { useAuth } from '@/src/providers/AuthProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Ionicons} from "@expo/vector-icons";

export default function ActivityScreen() {
  const { profile } = useAuth();
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

  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <FontAwesome size={16} style={styles.bell} name={'bell'} />
        <Text style={styles.headerTitle}>My Balance</Text>
        <Text style={styles.headerBalance}>{profile?.currency || '$'}{profile?.balance || '0.00'}</Text>
      </Animated.View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.activity}>Activity</Text>
          <TouchableOpacity style={styles.icon} onPress={() => { }}>
            <Text style={styles.activity}>See All</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="black"/>
          </TouchableOpacity>
        </View>
        <AnimatedFlatList
          data={activity}
          renderItem={({ item }) => <ActivityItem key={item.id} activity={item} />}
          contentContainerStyle={{ padding: 10 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        />
      </View>
    </SafeAreaView>
  );
}

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
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerBalance: {
    marginTop: 5,
    color: 'white',
    fontSize: 24,
  },
  bell: {
    color: 'white',
    fontSize: 25,
    alignSelf: "flex-end",
    marginRight: 25,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  activity: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 7,
    color: 'black',
  },
  icon: {
    flexDirection: 'row',
  }
});
