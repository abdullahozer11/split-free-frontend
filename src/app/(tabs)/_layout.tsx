import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Redirect, Tabs} from 'expo-router';
import Colors from '@/src/constants/Colors';
import {useColorScheme} from '@/src/components/useColorScheme';
import {useClientOnlyValue} from '@/src/components/useClientOnlyValue';
import {useAuth} from "@/src/providers/AuthProvider";
import {Feather} from "@expo/vector-icons";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <Feather size={28} style={{marginBottom: -3}} {...props} />;
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
        name="activity"
        options={{
          title: 'Activity',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="bell" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: 'Group',
          tabBarIcon: ({color}) => <TabBarIcon name="users" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: 'Expense',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="plus-circle" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="friend"
        options={{
          title: 'Friends',
          tabBarIcon: ({color}) => <TabBarIcon name="users" color={color}/>,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="user" color={color}/>,
        }}
      />
    </Tabs>
  );
}
