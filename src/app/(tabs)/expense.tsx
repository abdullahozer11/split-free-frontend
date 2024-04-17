import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Button from '../../components/Button';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button style={styles.button} textStyle={styles.buttonText} text={drawerOpen ? 'Close Drawer' : 'Open Drawer'} onPress={toggleDrawer}/>
      <View style={styles.sideBar}>
        <Text>Side Bar</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sideBar: {
    backgroundColor: 'gainsboro',
    width: '70%',
    height: '100%',
    position: 'absolute',
    top: 15,
    right: 0,
    zIndex: 100,
    borderTopStartRadius: 50,
    borderBottomStartRadius: 50,
    // display: "none",
  },
  button: {
    width: 130,
    height: 100,
    backgroundColor: 'black',
    borderRadius: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
