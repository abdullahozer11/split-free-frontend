import React, {useRef} from "react";
import {View, Animated, Image, ScrollView, Text} from "react-native";
import {StyleSheet} from 'react-native';

const H_MAX_HEIGHT = 160;
const H_MIN_HEIGHT = 60;
const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;

const CollapsibleHeader = ({content, headerContent}) => {
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const headerScrollHeight = scrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
    extrapolate: "clamp"
  });

  return (
    <View style={styles.container}>
      <ScrollView
        onScroll={Animated.event([
          {nativeEvent: {contentOffset: {y: scrollOffsetY}}}
        ])}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {content}
        </View>
      </ScrollView>
      <Animated.View
        style={[styles.header, {height: headerScrollHeight}]}
      >
        {headerContent}
      </Animated.View>
    </View>
  );
};

export default CollapsibleHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: H_MAX_HEIGHT,
    minHeight: 900,
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    width: "100%",
    overflow: "hidden",
    zIndex: 999,
    // STYLE
    padding: 10,
    backgroundColor: "black",
  },
});
