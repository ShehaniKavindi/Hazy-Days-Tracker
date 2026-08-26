import { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext(null);
const STORAGE_KEY = "hazy-days:settings";

export const ACCENTS = [
  { key: "sage", label: "Sage", value: "#8FC79D" },
  { key: "meadow", label: "Meadow", value: "#2F6B3E" },
  { key: "amber", label: "Amber", value: "#D99A4E" },
  { key: "rose", label: "Rose", value: "#B5537D" },
];

const DEFAULT_SETTINGS = {
  weekStart: "sunday", // "sunday" | "monday"
  accent: "sage",
};

export function getAccentColor(accentKey) {
  const found = ACCENTS.find((a) => a.key === accentKey);
  return found ? found.value : ACCENTS[0].value;
}

export function SettingsProvider({ children }) {
  const [weekStart, setWeekStart] = useState(DEFAULT_SETTINGS.weekStart);
  const [accent, setAccent] = useState(DEFAULT_SETTINGS.accent);
  const hasHydrated = useRef(false);

  // Load whatever was saved last time, once, on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.weekStart) setWeekStart(saved.weekStart);
          if (saved.accent) setAccent(saved.accent);
        }
      } catch (err) {
        console.warn("Failed to load saved settings:", err);
      } finally {
        hasHydrated.current = true;
      }
    })();
  }, []);

  // Persist on every change — but only after the initial load has finished,
  // otherwise the default starting state would overwrite real saved data.
  useEffect(() => {
    if (!hasHydrated.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ weekStart, accent }),
    ).catch((err) => {
      console.warn("Failed to save settings:", err);
    });
  }, [weekStart, accent]);

  const value = {
    weekStart,
    setWeekStart,
    // react-native-calendars expects 0 = Sunday, 1 = Monday
    firstDay: weekStart === "monday" ? 1 : 0,
    accent,
    setAccent,
    accentColor: getAccentColor(accent),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
