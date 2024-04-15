import {StyleSheet, Text, View} from 'react-native';
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign} from '@expo/vector-icons';
import {supabase} from "@/src/lib/supabase";


const SettingsItem = ({iconName, title, containerColor}) => {
  return (
    <View style={styles.settingsItemRow}>
      <View style={[styles.settingsItemIconContainer, {backgroundColor: containerColor}]}>
        <AntDesign name={iconName} size={32} color="white"/>
      </View>
      <Text style={styles.settingsItemText}>{title}</Text>
      <AntDesign name={iconName} size={24} color="arrowright"/>
    </View>
  );
};

const SettingsScreen = () => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AntDesign name="arrowleft" size={30} color="white"/>
      <Text style={styles.title}>Settings</Text>
      <SettingsItem containerColor={'blue'} iconName={'question'} title={'Notifications'}/>
      <SettingsItem containerColor={'lightblue'} iconName={'question'} title={'Currency'}/>
      <SettingsItem containerColor={'orange'} iconName={'question'} title={'FAQ'}/>
      <SettingsItem containerColor={'blue'} iconName={'question'} title={'Term of Use'}/>
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
    backgroundColor: 'black',
    padding: 20,
    flex: 1,
  },
  title: {
    marginTop: 30,
    fontSize: 40,
    fontWeight: '500',
    color: 'white',
  },
  settingsItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  settingsItemIconContainer: {
    backgroundColor: 'pink',
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemText: {
    color: 'white',
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
    fontSize: 20,
    fontWeight: '400',
    color: 'red',
    textAlign: 'center',
  },
  version: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    color: 'white',
  },
});
