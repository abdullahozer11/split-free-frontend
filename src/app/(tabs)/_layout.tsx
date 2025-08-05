import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";
import Colors from "@/src/constants/Colors";
import { useAuth } from "@/src/providers/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  // @ts-ignore
  return <Feather size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { session } = useAuth();
  const {settings} = useSettings();
  const int = translations[settings.language] || translations.en;

  if (!session) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          // display: route.name === 'account' ? 'none' : 'flex',
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarLabelStyle: {
          marginBottom: 5,
        },
        // headerTitleAlign: 'center',
      })}
    >
      {/*<Tabs.Screen*/}
      {/*  name="activity"*/}
      {/*  options={{*/}
      {/*    title: 'Activity',*/}
      {/*    tabBarIcon: ({color}) => <TabBarIcon name="bell" color={color}/>,*/}
      {/*  }}*/}
      {/*/>*/}
      <Tabs.Screen
        name="group"
        options={{
          title: int["Group"] || "Group",
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      {/*<Tabs.Screen*/}
      {/*  name="friend"*/}
      {/*  options={{*/}
      {/*    title: int["Friends"] || "Friends",*/}
      {/*    tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,*/}
      {/*  }}*/}
      {/*/>*/}
      <Tabs.Screen
        name="account"
        options={{
          title: int["Account"] || "Account",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
