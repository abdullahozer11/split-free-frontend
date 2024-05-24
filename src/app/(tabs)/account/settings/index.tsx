import {Pressable, StyleSheet, View} from 'react-native';
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Feather} from '@expo/vector-icons';
import {supabase} from "@/src/lib/supabase";
import {Link, useNavigation} from "expo-router";
import {Text, Switch} from "react-native-paper";


const SettingsItem = ({page, iconName, title, containerColor}) => {
  const path = page === 'terms' ? '/(auth)/terms' : `/(tabs)/account/settings/${page}`;
  return (
    <Link href={path} asChild>
      <Pressable style={styles.settingsItemRow}>
        <View style={styles.innerRow}>
          <View style={[styles.settingsItemIconContainer, {backgroundColor: containerColor}]}>
            <Feather name={iconName} size={24}/>
          </View>
          <Text>{title}</Text>
        </View>
        <Feather name={"chevron-right"} size={28}/>
      </Pressable>
    </Link>
  );
};

const SettingsScreen = () => {
  const [darkThemeOn, setDarkThemeOn] = useState(false);

  const navigation = useNavigation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => {
        navigation.goBack();
      }}>
        <Feather name="chevron-left" size={36}/>
      </Pressable>
      <Text variant={"headlineLarge"}>Settings</Text>
      <View>
        <SettingsItem page={'notifications'} containerColor={'blue'} iconName={'bell'} title={'Notifications'}/>
        <SettingsItem page={'language'} containerColor={'darkorange'} iconName={'globe'} title={'Language'}/>
        <SettingsItem page={'faq'} containerColor={'orange'} iconName={'help-circle'} title={'FAQ'}/>
        <SettingsItem page={'terms'} containerColor={'blue'} iconName={'check'} title={'Term of Use'}/>
        {/*<View style={styles.settingsItemRow}>*/}
        {/*  <View style={styles.innerRow}>*/}
        {/*    <View style={[styles.settingsItemIconContainer, {backgroundColor: "black"}]}>*/}
        {/*      <Feather name={"moon"} size={24} color={'white'}/>*/}
        {/*    </View>*/}
        {/*    <Text>Dark mode</Text>*/}
        {/*  </View>*/}
        {/*  <Switch*/}
        {/*    thumbColor={darkThemeOn ? 'darkgrey' : 'yellow'}*/}
        {/*    trackColor={{true: 'orange', false: 'darkgrey'}}*/}
        {/*    onValueChange={() => {*/}
        {/*      setDarkThemeOn(!darkThemeOn);*/}
        {/*    }}*/}
        {/*    value={darkThemeOn}*/}
        {/*  />*/}
        {/*</View>*/}
      </View>
      <View style={styles.footer}>
        <Text onPress={handleSignOut} style={styles.logout}>
          Log out
        </Text>
        <Text style={styles.version}>
          SplitFree 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F6F6FF',
    padding: 20,
    flex: 1,
    gap: 10,
  },
  title: {
    marginTop: 30,
    fontWeight: '500',
    marginBottom: 40,
  },
  settingsItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: "space-between"
  },
  settingsItemIconContainer: {
    backgroundColor: 'pink',
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: 10,
    marginBottom: 20,
  },
  logout: {
    fontWeight: '400',
    color: 'red',
    textAlign: 'center',
  },
  version: {
    fontWeight: '400',
    textAlign: 'center',
  },
  innerRow: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 20,
  },
});
