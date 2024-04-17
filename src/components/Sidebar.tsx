import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, View, Text, TextInput, Animated} from 'react-native';
import Button from "@/src/components/Button";

const Sidebar = ({onToggle, onSubmit}) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const sidebarAnimation = useRef(new Animated.Value(0)).current;
  const [name, setName] = useState('');
  const [newParticipants, setNewParticipants] = useState([]);

  return (
    <Animated.View style={[styles.sideBar, {
      transform: [{
        translateX: sidebarAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [250, 0]
        })
      }]
    }]}>
      <View style={styles.sideBarHeader}>
        <Text style={styles.sideBarTitle}>
          Add Participants
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Member Name"
          style={styles.sideBarInput}
        />
      </View>
      <View style={styles.sideBarFooter}>
        <Button style={styles.sideBarBtn} textStyle={styles.sideBarBtnText} text="Cancel" onPress={onToggle}/>
        <Button style={styles.sideBarBtn} textStyle={styles.sideBarBtnText} text="Done"
                onPress={onSubmit}/>
      </View>
    </Animated.View>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  sideBar: {
    backgroundColor: 'gainsboro',
    width: 250,
    height: '105%',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    justifyContent: "space-between",
    // display: "none",
  },
  sideBarHeader: {
    padding: 10,
    gap: 15,
    alignSelf: "center",
  },
  sideBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
  },
  sideBarInput: {
    width: 200,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  sideBarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 40,
  },
  sideBarFooterButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  sideBarBtn: {
    backgroundColor: 'transparent',
    padding: 10,
    marginBottom: 16,
  },
  sideBarBtnText: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
});
