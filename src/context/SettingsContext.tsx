import { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext(null);
const STORAGE_KEY = "hazy-days:settings";

export const ACCENTS = [
  {
    key: "sage",
    label: "Sage",
    value: "#8FC79D",
    // Sage keeps the app's original hand-picked shades — not derived.
    headingColor: "#5d8366",
    cleanDaysColor: "#2F6B3E",
  },
  {
    key: "meadow",
    label: "Meadow",
    value: "#2F6B3E",
    headingColor: "#1F4A2A",
    cleanDaysColor: "#A9D9B4",
  },
  {
    key: "amber",
    label: "Amber",
    value: "#D99A4E",
    headingColor: "#96591C",
    cleanDaysColor: "#F3D9A8",
  },
  {
    key: "rose",
    label: "Rose",
    value: "#B5537D",
    headingColor: "#7A3557",
    cleanDaysColor: "#F3CDE0",
  },
];

const DEFAULT_SETTINGS = {
  weekStart: "sunday", // "sunday" | "monday"
  accent: "sage",
};

export function getAccentColor(accentKey) {
  const found = ACCENTS.find((a) => a.key === accentKey);
  return found ? found.value : ACCENTS[0].value;
}

export function getAccentEntry(accentKey) {
  return ACCENTS.find((a) => a.key === accentKey) ?? ACCENTS[0];
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
    headingColor: getAccentEntry(accent).headingColor,
    cleanDaysColor: getAccentEntry(accent).cleanDaysColor,
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
