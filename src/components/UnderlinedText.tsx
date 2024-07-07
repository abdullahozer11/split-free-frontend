import {StyleSheet, View, Text} from 'react-native';
import React from "react";

const UnderlinedText = ({ text, fontSize, fontWeight }) => {
  return (
    <View className='items-center mb-4'>
      <Text style={{fontSize: fontSize, fontWeight: fontWeight}}>{text}</Text>
      <View style={{top: fontSize - 4}} className='bg-orange-400 h-3 w-full absolute opacity-50'/>
    </View>
  );
};

export default UnderlinedText;
