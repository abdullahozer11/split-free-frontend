import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import {
  isLanguage,
  setActiveLanguage,
  type Language,
} from "@/src/translations";

export type Settings = {
  language: Language;
  theme: string;
  fontSize: string;
};

type SettingsInput = {
  language?: string | null;
  theme?: string;
  fontSize?: string;
};

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (next: SettingsInput) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

const getDefaultLanguage = (): Language => {
  const deviceLanguage = getLocales()[0]?.languageCode;
  if (isLanguage(deviceLanguage)) {
    return deviceLanguage;
  }
  return "en";
};

const defaultSettings: Settings = {
  language: getDefaultLanguage(),
  theme: "light",
  fontSize: "medium",
};

function normalizeSettings(
  input: SettingsInput | null | undefined,
  fallback: Settings = defaultSettings,
): Settings {
  return {
    language: isLanguage(input?.language) ? input.language : fallback.language,
    theme: typeof input?.theme === "string" ? input.theme : fallback.theme,
    fontSize:
      typeof input?.fontSize === "string" ? input.fontSize : fallback.fontSize,
  };
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    setActiveLanguage(settings.language);
  }, [settings.language]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("settings");
        if (savedSettings) {
          setSettings(normalizeSettings(JSON.parse(savedSettings)));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: SettingsInput) => {
    const next = normalizeSettings(newSettings, settings);
    try {
      await AsyncStorage.setItem("settings", JSON.stringify(next));
      setSettings(next);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
