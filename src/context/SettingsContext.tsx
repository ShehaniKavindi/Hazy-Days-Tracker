import { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext(null);
const STORAGE_KEY = "hazy-days:settings";

// The "clean" day mark on the calendar keeps this look for the green
// themes (sage/meadow already read as "clean"); other themes get a light
// tint of their own accent instead.
const DEFAULT_CLEAN_TINT = { bg: "#F1F7EA", text: "#5C6B58" };

export const ACCENTS = [
  {
    key: "sage",
    label: "Sage",
    value: "#8FC79D",
    // Sage keeps the app's original hand-picked shade — not derived.
    headingColor: "#5d8366",
    cleanTint: DEFAULT_CLEAN_TINT,
  },
  {
    key: "meadow",
    label: "Meadow",
    value: "#2F6B3E",
    headingColor: "#2C5C3A",
    cleanTint: DEFAULT_CLEAN_TINT,
  },
  {
    key: "amber",
    label: "Amber",
    value: "#D99A4E",
    headingColor: "#AD6B22",
    cleanTint: { bg: "#fef9f1", text: "#AD6B22" },
  },
  {
    key: "rose",
    label: "Rose",
    value: "#B5537D",
    headingColor: "#8C4468",
    cleanTint: { bg: "#fdf3f8", text: "#8C4468" },
  },
  {
    key: "lavender",
    label: "Lavender",
    value: "#B39DDB",
    headingColor: "#5E4B8B",
    cleanTint: { bg: "#f6f3fc", text: "#5E4B8B" },
  },
  {
    key: "skyblue",
    label: "Cyan",
    value: "#8EC5E8",
    headingColor: "#3B6E90",
    cleanTint: { bg: "#f3faff", text: "#3B6E90" },
  },
];

// The "clean days" number on the Profile screen always stays this color,
// regardless of which accent theme is active.
export const CLEAN_DAYS_COLOR = "#2F6B3E";

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
    cleanDaysColor: CLEAN_DAYS_COLOR,
    cleanColors: getAccentEntry(accent).cleanTint,
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
