import {Tabs} from 'expo-router';

export default function GroupStack() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          height: 130,
        },
        headerTitleStyle: {
          fontSize: 40,
        },
        tabBarStyle: {
          height: 60,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{title: 'Group', tabBarStyle: {display: 'none'}}}/>
      <Tabs.Screen name="create" options={{title: 'Create', tabBarStyle: {display: 'none'}, headerShown: true}}/>
    </Tabs>
  );
}
