import { createContext, useContext, useState } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // "sunday" | "monday"
  const [weekStart, setWeekStart] = useState("sunday");

  const value = {
    weekStart,
    setWeekStart,
    // react-native-calendars expects 0 = Sunday, 1 = Monday
    firstDay: weekStart === "monday" ? 1 : 0,
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
