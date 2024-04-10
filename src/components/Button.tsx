import { Pressable, StyleSheet, Text, View, StyleProp, ViewStyle, ReactNode } from 'react-native';
import Colors from '../constants/Colors';
import React, { forwardRef } from 'react';

type ButtonProps = {
  text: string;
  accessoryLeft?: ReactNode; // ReactNode can be any renderable JSX element
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<ViewStyle>;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Button = forwardRef<View | null, ButtonProps>(
  ({ text, accessoryLeft, style, textStyle, ...pressableProps }, ref) => {
    return (
      <Pressable ref={ref} {...pressableProps} style={[styles.container, style]}>
        {accessoryLeft && <View>{accessoryLeft}</View>}
        <Text style={[styles.text, textStyle]}>{text}</Text>
        {accessoryLeft && <View/>}
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tint,
    padding: 15,
    alignItems: 'center',
    borderRadius: 100,
    marginVertical: 10,
    justifyContent: "space-around"
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default Button;
