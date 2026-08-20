import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Text } from "@/src/components/Translated";
import React from "react";

type ButtonProps = PressableProps & {
  text: string;
  accessoryLeft?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const Button = ({
  text,
  accessoryLeft,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) => {
  return (
    <Pressable
      {...pressableProps}
      className="flex-row bg-black p-4 items-center rounded-full my-4 justify-around"
      style={style}
    >
      {accessoryLeft && <View>{accessoryLeft}</View>}
      <Text
        style={[{ fontSize: 16, fontWeight: "600", color: "white" }, textStyle]}
      >
        {text}
      </Text>
      {accessoryLeft && <View />}
    </Pressable>
  );
};

export default Button;
