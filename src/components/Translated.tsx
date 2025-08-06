import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  Menu as RNMenu,
  Button as RNButton,
  Dialog as RNDialog,
} from "react-native-paper";
import { Alert as RNAlert } from "react-native";
import { Link as ERLink } from "expo-router";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider.js";


export const Text = ({children, ...textProps}) => {
  const {t} = useTranslations();

  // If translationKey is provided, use translation
  // Otherwise, use children as fallback
  const displayText = t(children);

  return (
    <RNText {...textProps}>
      {displayText}
    </RNText>
  );
};

export const TextInput = ({
                            label,
                            placeholder,
                            error,
                            helperText,
                            ...textInputProps
                          }) => {
  const {t} = useTranslations();

  // Translate label, placeholder, error, and helperText if they exist
  const translatedLabel = label ? t(label) : undefined;
  const translatedPlaceholder = placeholder ? t(placeholder) : undefined;
  const translatedError = error ? t(error) : undefined;
  const translatedHelperText = helperText ? t(helperText) : undefined;

  return (
    <RNTextInput
      {...textInputProps}
      label={translatedLabel}
      placeholder={translatedPlaceholder}
      error={translatedError}
      helperText={translatedHelperText}
    />
  );
};

// Attach static subcomponents from the original TextInput
TextInput.Icon = RNTextInput.Icon;
TextInput.Affix = RNTextInput.Affix;

// Hook for translated alert and prompt to allow using translations within components
export const useTranslatedAlert = () => {
  const {t} = useTranslations();

  const alert = React.useCallback((title, message, buttons, options) => {
    // Translate title and message
    const translatedTitle = title ? t(title) : title;
    const translatedMessage = message ? t(message) : message;

    // Translate button texts if buttons array is provided
    const translatedButtons = buttons?.map(button => ({
      ...button,
      text: button.text ? t(button.text) : button.text
    }));

    return RNAlert.alert(
      translatedTitle,
      translatedMessage,
      translatedButtons,
      options
    );
  }, [t]);

  const prompt = React.useCallback((title, message, callbackOrButtons, type, defaultValue, keyboardType) => {
    // Translate title and message
    const translatedTitle = title ? t(title) : title;
    const translatedMessage = message ? t(message) : message;

    // Handle different parameter combinations for prompt
    let translatedButtonsOrCallback = callbackOrButtons;
    if (Array.isArray(callbackOrButtons)) {
      // If second parameter is buttons array, translate button texts
      translatedButtonsOrCallback = callbackOrButtons.map(button => ({
        ...button,
        text: button.text ? t(button.text) : button.text
      }));
    }

    return RNAlert.prompt(
      translatedTitle,
      translatedMessage,
      translatedButtonsOrCallback,
      type,
      defaultValue,
      keyboardType
    );
  }, [t]);

  return {alert, prompt};
};

// Hook for accessing translations directly in components
export const useTranslations = () => {
  const {settings} = useSettings();
  const int = translations[settings.language] || translations.en;

  const t = key => int[key] || key;

  return {t, translations: int};
};

export const Link = ({children, ...props}) => {
  const {t} = useTranslations();

  // Translate children if it's a string and translation exists
  const translatedChildren = typeof children === 'string'
    ? t(children)
    : children;

  return (
    <ERLink {...props}>
      {translatedChildren}
    </ERLink>
  );
};

export const MenuItem = ({title, ...menuItemProps}) => {
  const {t} = useTranslations();

  // Translate the title if it exists
  const translatedTitle = title ? t(title) : title;

  return (
    <RNMenu.Item
      {...menuItemProps}
      title={translatedTitle}
    />
  );
};

export const Button = ({children, ...buttonProps}) => {
  const {t} = useTranslations();

  // Translate children if it's a string and translation exists
  const translatedChildren = typeof children === 'string'
    ? t(children)
    : children;

  return (
    <RNButton {...buttonProps}>
      {translatedChildren}
    </RNButton>
  );
};


export const DialogTitle = ({children, ...titleProps}) => {
  const {t} = useTranslations();

  // Translate children if it's a string and translation exists
  const translatedChildren = typeof children === 'string'
    ? t(children)
    : children;

  return (
    <RNDialog.Title {...titleProps}>
      {translatedChildren}
    </RNDialog.Title>
  );
};
