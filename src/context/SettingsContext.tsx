import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

const SettingsContext = createContext(null);
const STORAGE_KEY = "hazy-days:settings";

// expo-notifications runs a push-token auto-registration side effect the
// moment it's imported — and that side effect throws on Android inside Expo
// Go (SDK 53+ dropped remote push there), which was taking down every
// screen that (indirectly) imports this file. We only need *local*
// scheduled reminders, so the module is loaded lazily below, only when a
// reminder is actually scheduled or cancelled, instead of at the top of
// this file.
let notificationsModulePromise = null;
function loadNotifications() {
  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications");
  }
  return notificationsModulePromise;
}

// Expo Go on Android can't schedule or receive notifications at all since
// SDK 53 — everywhere else (iOS Expo Go, dev builds, production) is fine.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const notificationsAvailable = !(Platform.OS === "android" && isExpoGo);

// The "clean" day mark on the calendar keeps this look for the green
// themes (sage/meadow already read as "clean"); other themes get a light
// tint of their own accent instead.
const DEFAULT_CLEAN_TINT = { bg: "#F1F7EA", text: "#5C6B58" };

function to24Hour(hour12, period) {
  let hour = hour12 % 12;
  if (period === "PM") hour += 12;
  return hour;
}

async function scheduleReminderNotification(hour12, minute, period) {
  if (!notificationsAvailable) {
    console.warn("Notifications aren't available in Expo Go on Android — use a development build.");
    return false;
  }

  const Notifications = await loadNotifications();

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    return false; // permission denied — caller decides how to handle this
  }

  // Clear any previously scheduled reminder before setting a new one,
  // so changing the time doesn't leave two notifications firing.
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hazy Days",
      body: "Don't forget to log today.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: to24Hour(hour12, period),
      minute,
    },
  });

  return true;
}

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

  // Reminder state lives here too, so it persists the same way weekStart/accent do.
  const [reminderOn, setReminderOnState] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [reminderPeriod, setReminderPeriod] = useState("PM");

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
          if (typeof saved.reminderOn === "boolean") setReminderOnState(saved.reminderOn);
          if (saved.reminderHour) setReminderHour(saved.reminderHour);
          if (typeof saved.reminderMinute === "number") setReminderMinute(saved.reminderMinute);
          if (saved.reminderPeriod) setReminderPeriod(saved.reminderPeriod);
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
      JSON.stringify({ weekStart, accent, reminderOn, reminderHour, reminderMinute, reminderPeriod }),
    ).catch((err) => {
      console.warn("Failed to save settings:", err);
    });
  }, [weekStart, accent, reminderOn, reminderHour, reminderMinute, reminderPeriod]);

  // Turning the reminder on asks for permission and schedules the daily
  // notification; turning it off cancels whatever's scheduled.
  async function setReminderOn(value) {
    if (value) {
      const granted = await scheduleReminderNotification(reminderHour, reminderMinute, reminderPeriod);
      setReminderOnState(granted); // only actually turn it on if permission was granted
    } else {
      if (notificationsAvailable) {
        const Notifications = await loadNotifications();
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      setReminderOnState(false);
    }
  }

  // Called once, when the user confirms a new time in the picker —
  // updates the stored time and reschedules only if reminders are active.
  function updateReminderTime(hour, minute, period) {
    setReminderHour(hour);
    setReminderMinute(minute);
    setReminderPeriod(period);
    if (reminderOn) {
      scheduleReminderNotification(hour, minute, period);
    }
  }

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
    reminderOn,
    setReminderOn,
    reminderHour,
    reminderMinute,
    reminderPeriod,
    updateReminderTime,
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