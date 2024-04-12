import {FlatList, View, StyleSheet} from 'react-native';
import ActivityItem from "@/src/components/ActivityItem";
import {activity} from "@/assets/data/activity";

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={activity}
        renderItem={({item}) => <ActivityItem key={item.id} activity={item}/>}
        contentContainerStyle={{gap: 10, padding: 10}}
      />
    </View>
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
