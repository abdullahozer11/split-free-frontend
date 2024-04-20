import React from 'react';
import {FlatList, Text, View, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import ActivityItem from '@/src/components/ActivityItem';
import {activity} from '@/assets/data/activity';
import {useAuth} from '@/src/providers/AuthProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Ionicons} from "@expo/vector-icons";
import CollapsableHeader from "@/src/components/CollapsableHeader";
import {groupElementsByDay} from "@/src/utils/helpers";

export default function ActivityScreen() {
  const {profile} = useAuth();

  const groupedActivities = groupElementsByDay(activity);

  return (
    <View style={styles.container}>
      <CollapsableHeader H_MAX_HEIGHT={200} H_MIN_HEIGHT={52} content={
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.activity}>Activity</Text>
            <TouchableOpacity style={styles.icon} onPress={() => {
            }}>
              <Text style={styles.activity}>See All</Text>
              <Ionicons name="chevron-forward-outline" size={24} color="black"/>
            </TouchableOpacity>
          </View>
          <View style={{padding: 10}}>
            {Object.keys(groupedActivities).map((item) => (
              <View style={styles.activityGroup} key={item}>
                <Text style={styles.date}>{item}</Text>
                {groupedActivities[item].map((activity) => (
                  <ActivityItem key={activity.id} activity={activity}/>
                ))}
              </View>
            ))}
          </View>
        </View>
      } headerContent={
        <View style={styles.header}>
          <FontAwesome size={16} style={styles.bell} name={'bell'}/>
          <Text style={styles.headerTitle}>My Balance</Text>
          <Text style={styles.headerBalance}>{profile?.currency || '$'}{profile?.balance || '0.00'}</Text>
        </View>
      }/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    padding: 10,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
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
  activityGroup: {
    marginTop: 10,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  activity: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 7,
    color: 'black',
    backgroundColor: 'white'
  },
  icon: {
    flexDirection: 'row',
  },
});
