import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  Menu as RNMenu,
  Button as RNButton,
  Dialog as RNDialog,
} from "react-native-paper";
import {
  Alert as RNAlert,
  type AlertButton,
  type AlertOptions,
  type AlertType,
} from "react-native";
import { cssInterop } from "nativewind";
import { Link as ERLink, Stack as ERStack } from "expo-router";
import {
  getActiveDictionary,
  getDictionary,
  lookupMessage,
} from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider";

type TextInputIconProps = React.ComponentProps<typeof RNTextInput.Icon>;

function withTransparentIcon(adornment?: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(adornment) || adornment.type !== RNTextInput.Icon) {
    return adornment;
  }

  const icon = adornment as React.ReactElement<TextInputIconProps>;
  return React.cloneElement(icon, {
    containerColor: icon.props.containerColor ?? "transparent",
  });
}

function translateButtons(buttons?: AlertButton[]): AlertButton[] | undefined {
  if (!buttons) {
    return buttons;
  }
  const dictionary = getActiveDictionary();
  return buttons.map((button) => ({
    ...button,
    text: button.text ? lookupMessage(dictionary, button.text) : button.text,
  }));
}

export const Text = ({
  children,
  ...textProps
}: React.ComponentProps<typeof RNText>) => {
  const { t } = useTranslations();
  const displayText = typeof children === "string" ? t(children) : children;

  return <RNText {...textProps}>{displayText}</RNText>;
};

type TextInputProps = React.ComponentProps<typeof RNTextInput> & {
  helperText?: string;
};

function TextInputComponent({
  label,
  placeholder,
  error,
  helperText: _helperText,
  style,
  contentStyle,
  left,
  right,
  ...textInputProps
}: TextInputProps) {
  const { t } = useTranslations();
  const translatedLabel = typeof label === "string" ? t(label) : label;
  const translatedPlaceholder =
    typeof placeholder === "string" ? t(placeholder) : placeholder;

  return (
    <RNTextInput
      {...textInputProps}
      label={translatedLabel}
      placeholder={translatedPlaceholder}
      error={Boolean(error)}
      left={withTransparentIcon(left)}
      right={withTransparentIcon(right)}
      style={[{ backgroundColor: "white" }, style]}
      contentStyle={[{ backgroundColor: "transparent" }, contentStyle]}
    />
  );
}

type StyledTextInput = typeof TextInputComponent & {
  Icon: typeof RNTextInput.Icon;
  Affix: typeof RNTextInput.Affix;
};

export const TextInput = cssInterop(TextInputComponent, {
  className: "style",
}) as StyledTextInput;

TextInput.Icon = RNTextInput.Icon;
TextInput.Affix = RNTextInput.Affix;

export const Alert = {
  alert: (
    title?: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) => {
    const dictionary = getActiveDictionary();
    return RNAlert.alert(
      title ? lookupMessage(dictionary, title) : "",
      message ? lookupMessage(dictionary, message) : message,
      translateButtons(buttons),
      options,
    );
  },

  prompt: (
    title?: string,
    message?: string,
    callbackOrButtons?: AlertButton[] | ((text: string) => void),
    type?: AlertType,
    defaultValue?: string,
    keyboardType?: string,
  ) => {
    const dictionary = getActiveDictionary();
    const translatedTitle = title ? lookupMessage(dictionary, title) : "";
    const translatedMessage = message
      ? lookupMessage(dictionary, message)
      : message;

    const translatedButtons = Array.isArray(callbackOrButtons)
      ? translateButtons(callbackOrButtons)
      : callbackOrButtons;

    return RNAlert.prompt(
      translatedTitle,
      translatedMessage,
      translatedButtons,
      type,
      defaultValue,
      keyboardType,
    );
  },
};

export const useTranslations = () => {
  const { settings } = useSettings();
  const dictionary = getDictionary(settings.language);

  const t = (key: string, fallback?: string) =>
    lookupMessage(dictionary, key, fallback);

  return { t, translations: dictionary, language: settings.language };
};

export const Link = ({
  children,
  ...props
}: React.ComponentProps<typeof ERLink>) => {
  const { t } = useTranslations();
  const translatedChildren =
    typeof children === "string" ? t(children) : children;

  return <ERLink {...props}>{translatedChildren}</ERLink>;
};

type StackScreenProps = React.ComponentProps<typeof ERStack.Screen>;

function translateOptionStrings<T extends Record<string, unknown>>(
  opts: T,
  t: (key: string) => string,
): T {
  const translated = { ...opts };
  const keys = [
    "title",
    "headerTitle",
    "headerBackTitle",
    "tabBarLabel",
  ] as const;

  for (const key of keys) {
    const value = translated[key];
    if (typeof value === "string") {
      (translated as Record<string, unknown>)[key] = t(value);
    }
  }

  return translated;
}

export const StackScreen = ({ options, ...props }: StackScreenProps) => {
  const { t } = useTranslations();

  let translatedOptions = options;
  if (options && typeof options === "object") {
    translatedOptions = translateOptionStrings(
      options as Record<string, unknown>,
      t,
    ) as typeof options;
  }

  return <ERStack.Screen {...props} options={translatedOptions} />;
};

export const MenuItem = ({
  title,
  ...menuItemProps
}: React.ComponentProps<typeof RNMenu.Item>) => {
  const { t } = useTranslations();
  const translatedTitle = typeof title === "string" ? t(title) : title;

  return <RNMenu.Item {...menuItemProps} title={translatedTitle} />;
};

export const Button = ({
  children,
  ...buttonProps
}: React.ComponentProps<typeof RNButton>) => {
  const { t } = useTranslations();
  const translatedChildren =
    typeof children === "string" ? t(children) : children;

  return <RNButton {...buttonProps}>{translatedChildren}</RNButton>;
};

export const DialogTitle = ({
  children,
  ...titleProps
}: React.ComponentProps<typeof RNDialog.Title>) => {
  const { t } = useTranslations();
  const translatedChildren =
    typeof children === "string" ? t(children) : children;

  return <RNDialog.Title {...titleProps}>{translatedChildren}</RNDialog.Title>;
};
