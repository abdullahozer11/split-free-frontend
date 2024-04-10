import { Pressable, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';
import React, { forwardRef } from 'react';

type ButtonProps = {
  text: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<ViewStyle>;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Button = forwardRef<View | null, ButtonProps>(
  ({ text, style, textStyle, ...pressableProps }, ref) => {
    return (
      <Pressable ref={ref} {...pressableProps} style={[styles.container, style]}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    alignItems: 'center',
    borderRadius: 100,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default Button;
