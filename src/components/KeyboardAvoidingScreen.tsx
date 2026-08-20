import React, { useContext } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { HeaderHeightContext } from "@react-navigation/elements";

const KeyboardAvoidingScreen = ({
  children,
  header,
  className = "flex-1 bg-white",
  contentContainerClassName = "flex-grow justify-center p-5",
}) => {
  const headerHeight = useContext(HeaderHeightContext) ?? 0;

  return (
    <KeyboardAvoidingView
      className={className}
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      {header}
      <ScrollView
        contentContainerClassName={contentContainerClassName}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingScreen;
