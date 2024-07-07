import { Pressable, Text, View } from "react-native";
import React from "react";

const Button = ({
  text,
  accessoryLeft,
  style,
  textStyle,
  ...pressableProps
}) => {
  return (
    <Pressable
      {...pressableProps}
      className="flex-row bg-light-tint p-4 items-center rounded-full my-4 justify-around"
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
