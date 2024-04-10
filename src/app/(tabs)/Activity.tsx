import {FlatList, StyleSheet, Text} from 'react-native';
import ActivityItem from "@/src/components/ActivityItem";
import {activity} from "@/assets/data/activity";
import {SafeAreaView} from "react-native-safe-area-context";

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.bigTitle}>Activities</Text>
      <FlatList
        data={activity}
        renderItem={({item}) => <ActivityItem key={item.id} activity={item}/>}
        contentContainerStyle={{gap: 10, padding: 10}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  bigTitle: {
    fontSize: 32,
    fontWeight: '500',
    marginBottom: 20,
  },
});
