import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import {ActivityIndicator} from "react-native-paper";

const AnimatedLoader = () => {
  return (
    <Modal transparent={true} animationType="slide" visible={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color="black" />
        </View>
      </View>
    </Modal>
  );
};

export default AnimatedLoader;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the transparency as needed
  },
  modalContent: {
    width: 80, // Adjust the width as needed
    height: 80, // Adjust the height as needed
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
