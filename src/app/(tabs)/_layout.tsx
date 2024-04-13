import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Redirect, Tabs} from 'expo-router';
import Colors from '@/src/constants/Colors';
import {useColorScheme} from '@/src/components/useColorScheme';
import {useClientOnlyValue} from '@/src/components/useClientOnlyValue';
import {useAuth} from "@/src/providers/AuthProvider";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const {session} = useAuth();

  if (!session) {
    return (
      <Redirect href={'/sign-in'}/>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
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
        // headerTitleAlign: 'center',
      }}>
      <Tabs.Screen
        name="Activity"
        options={{
          title: 'Activity',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="bell" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Group"
        options={{
          title: 'Group',
          tabBarIcon: ({color}) => <TabBarIcon name="group" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Friend"
        options={{
          title: 'Friend',
          tabBarIcon: ({color}) => <TabBarIcon name="users" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="user" color={color}/>,
        }}
      />
    </Tabs>
  );
}
