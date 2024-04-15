import React, {useEffect, useState} from "react";
import {Pressable, StyleSheet, Animated} from "react-native";

const RNSwitch = ({
                    handleOnPress,
                    activeTrackColor,
                    inActiveTrackColor,
                    thumbColor,
                    value,
                  }) => {
  const [switchTranslate] = useState(new Animated.Value(0));

  useEffect(() => {
    if (value) {
      Animated.spring(switchTranslate, {
        toValue: 21,
        mass: 1,
        damping: 15,
        stiffness: 120,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(switchTranslate, {
        toValue: 0,
        mass: 1,
        damping: 15,
        stiffness: 120,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
        useNativeDriver: false,
      }).start();
    }
  }, [value, switchTranslate]);

  const interpolateBackgroundColor = switchTranslate.interpolate({
    inputRange: [0, 22],
    outputRange: [inActiveTrackColor, activeTrackColor],
  });

  const memoizedOnSwitchPressCallback = React.useCallback(() => {
    handleOnPress(!value);
  }, [handleOnPress, value]);

  return (
    <Pressable onPress={memoizedOnSwitchPressCallback}>
      <Animated.View
        style={[
          styles.containerStyle,
          {backgroundColor: interpolateBackgroundColor},
        ]}
      >
        <Animated.View
          style={[
            styles.circleStyle,
            {backgroundColor: thumbColor},
            {
              transform: [
                {
                  translateX: switchTranslate,
                },
              ],
            },
            styles.shadowValue,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circleStyle: {
    width: 24,
    height: 24,
    borderRadius: 24,
  },
  containerStyle: {
    width: 50,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 36.5,
  },
  shadowValue: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
});

export default RNSwitch;
