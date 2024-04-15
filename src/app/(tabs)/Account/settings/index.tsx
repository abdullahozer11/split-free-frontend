import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Feather} from '@expo/vector-icons';
import {supabase} from "@/src/lib/supabase";
import {useNavigation} from "expo-router";
import RNSwitch from "@/src/components/Switch";


const SettingsItem = ({iconName, title, containerColor}) => {
  return (
    <View style={styles.settingsItemRow}>
      <View style={styles.innerRow}>
        <View style={[styles.settingsItemIconContainer, {backgroundColor: containerColor}]}>
          <Feather name={iconName} size={24} color="white"/>
        </View>
        <Text style={styles.settingsItemText}>{title}</Text>
      </View>
      <AntDesign name={"right"} size={24} color="white"/>
    </View>
  );
};

const SettingsScreen = () => {
  const [darkThemeOn, setDarkThemeOn] = useState(false);

  const navigation = useNavigation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleDarkTheme = () => {
    console.log("toggleDarkTheme");
  };


  return (
    <SafeAreaView style={styles.container}>
      <AntDesign name="arrowleft" size={30} color="white" onPress={() => {
        navigation.goBack();
      }}/>
      <Text style={styles.title}>Settings</Text>
      <SettingsItem containerColor={'blue'} iconName={'bell'} title={'Notifications'}/>
      <SettingsItem containerColor={'lightblue'} iconName={'dollar-sign'} title={'Currency'}/>
      <SettingsItem containerColor={'orange'} iconName={'help-circle'} title={'FAQ'}/>
      <SettingsItem containerColor={'blue'} iconName={'check'} title={'Term of Use'}/>
      <View style={styles.settingsItemRow}>
        <View style={styles.innerRow}>
          <View style={[styles.settingsItemIconContainer, {backgroundColor: "black"}]}>
            <Feather name={"moon"} size={24} color="white"/>
          </View>
          <Text style={styles.settingsItemText}>Dark mode</Text>
        </View>
        <RNSwitch
          handleOnPress={toggleDarkTheme}
          activeTrackColor={'red'}
          inActiveTrackColor={'orange'}
          thumbColor={'darkgrey'}
          value={darkThemeOn}
        />
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
  innerRow: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 20,
  },
});
