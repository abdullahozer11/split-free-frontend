import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  Menu as RNMenu,
  Button as RNButton,
  Dialog as RNDialog,
} from "react-native-paper";
import { Alert as RNAlert } from "react-native";
import { cssInterop } from "nativewind";
import { Link as ERLink, Stack as ERStack } from "expo-router";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";

function withTransparentIcon(adornment) {
  if (!React.isValidElement(adornment) || adornment.type !== RNTextInput.Icon) {
    return adornment;
  }

  return React.cloneElement(adornment, {
    containerColor: adornment.props.containerColor ?? "transparent",
  });
}

export const Text = ({ children, ...textProps }) => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // If translationKey is provided, use translation
  // Otherwise, use children as fallback
  const displayText = int[children] || children;

  return <RNText {...textProps}>{displayText}</RNText>;
};

function TextInputComponent({
  label,
  placeholder,
  error,
  helperText,
  style,
  contentStyle,
  left,
  right,
  ...textInputProps
}) {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Translate label, placeholder, error, and helperText if they exist
  const translatedLabel = label ? int[label] || label : undefined;
  const translatedPlaceholder = placeholder
    ? int[placeholder] || placeholder
    : undefined;
  const translatedError = error ? int[error] || error : undefined;
  const translatedHelperText = helperText
    ? int[helperText] || helperText
    : undefined;

  return (
    <RNTextInput
      {...textInputProps}
      label={translatedLabel}
      placeholder={translatedPlaceholder}
      error={translatedError}
      helperText={translatedHelperText}
      left={withTransparentIcon(left)}
      right={withTransparentIcon(right)}
      style={[{ backgroundColor: "white" }, style]}
      contentStyle={[{ backgroundColor: "transparent" }, contentStyle]}
    />
  );
}

export const TextInput = cssInterop(TextInputComponent, {
  className: "style",
});

// Attach static subcomponents from the original TextInput
TextInput.Icon = RNTextInput.Icon;
TextInput.Affix = RNTextInput.Affix;

export const Alert = {
  alert: (title, message, buttons, options) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- RN Alert wrapper, not a component
    const { settings } = useSettings();
    const int = translations[settings.language] || translations.en;

    // Translate title and message
    const translatedTitle = title ? int[title] || title : title;
    const translatedMessage = message ? int[message] || message : message;

    // Translate button texts if buttons array is provided
    const translatedButtons = buttons?.map((button) => ({
      ...button,
      text: button.text ? int[button.text] || button.text : button.text,
    }));

    return RNAlert.alert(
      translatedTitle,
      translatedMessage,
      translatedButtons,
      options,
    );
  },

  prompt: (
    title,
    message,
    callbackOrButtons,
    type,
    defaultValue,
    keyboardType,
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- RN Alert wrapper, not a component
    const { settings } = useSettings();
    const int = translations[settings.language] || translations.en;

    // Translate title and message
    const translatedTitle = title ? int[title] || title : title;
    const translatedMessage = message ? int[message] || message : message;

    // Handle different parameter combinations for prompt
    let translatedButtons;
    if (Array.isArray(callbackOrButtons)) {
      // If second parameter is buttons array, translate button texts
      translatedButtons = callbackOrButtons.map((button) => ({
        ...button,
        text: button.text ? int[button.text] || button.text : button.text,
      }));
    }

    return RNAlert.prompt(
      translatedTitle,
      translatedMessage,
      translatedButtons || callbackOrButtons,
      type,
      defaultValue,
      keyboardType,
    );
  },
};

// Hook for accessing translations directly in components
export const useTranslations = () => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  const t = (key, fallback = undefined) => int[key] || fallback || key;

  return { t, translations: int };
};

export const Link = ({ children, ...props }) => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Translate children if it's a string and translation exists
  const translatedChildren =
    typeof children === "string" ? int[children] || children : children;

  return <ERLink {...props}>{translatedChildren}</ERLink>;
};

/** Translates Stack.Screen option strings. Use inside a screen, not as a layout child — Expo Router layouts require `Stack.Screen` by component identity. */
export const StackScreen = ({ options, ...props }) => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Helper function to recursively translate options
  const translateOptions = (opts) => {
    if (!opts || typeof opts !== "object") return opts;

    const translated = { ...opts };

    // Translate common option properties
    if (translated.title && typeof translated.title === "string") {
      translated.title = int[translated.title] || translated.title;
    }

    if (translated.headerTitle && typeof translated.headerTitle === "string") {
      translated.headerTitle =
        int[translated.headerTitle] || translated.headerTitle;
    }

    if (
      translated.headerBackTitle &&
      typeof translated.headerBackTitle === "string"
    ) {
      translated.headerBackTitle =
        int[translated.headerBackTitle] || translated.headerBackTitle;
    }

    // Translate tabBarLabel for tab screens
    if (translated.tabBarLabel && typeof translated.tabBarLabel === "string") {
      translated.tabBarLabel =
        int[translated.tabBarLabel] || translated.tabBarLabel;
    }

    return translated;
  };

  const translatedOptions = options ? translateOptions(options) : undefined;

  return <ERStack.Screen {...props} options={translatedOptions} />;
};

export const MenuItem = ({ title, ...menuItemProps }) => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Translate the title if it exists
  const translatedTitle = title ? int[title] || title : title;

  return <RNMenu.Item {...menuItemProps} title={translatedTitle} />;
};

export const Button = ({ children, ...buttonProps }) => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Translate children if it's a string and translation exists
  const translatedChildren =
    typeof children === "string" ? int[children] || children : children;

  return <RNButton {...buttonProps}>{translatedChildren}</RNButton>;
};

export const DialogTitle = ({ children, ...titleProps }) => {
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;

  // Translate children if it's a string and translation exists
  const translatedChildren =
    typeof children === "string" ? int[children] || children : children;

  return <RNDialog.Title {...titleProps}>{translatedChildren}</RNDialog.Title>;
};
