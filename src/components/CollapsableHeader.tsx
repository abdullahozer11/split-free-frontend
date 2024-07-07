import React, { useRef } from "react";
import { View, Animated, ScrollView } from "react-native";

const CollapsibleHeader = ({
  content,
  headerContent,
  H_MAX_HEIGHT,
  H_MIN_HEIGHT,
}) => {
  const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const headerScrollHeight = scrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  return (
    <View className={"flex-1"}>
      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View style={{ paddingTop: H_MAX_HEIGHT }} className={"min-h-900"}>
          {content}
        </View>
      </ScrollView>
      <Animated.View
        style={{ height: headerScrollHeight }}
        className="absolute left-0 right-0 top-0 w-full overflow-hidden z-999 p-10 bg-black"
      >
        {headerContent}
      </Animated.View>
    </View>
  );
};

export default CollapsibleHeader;
