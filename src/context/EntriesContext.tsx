import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EntriesContext = createContext(null);
const STORAGE_KEY = "hazy-days:entries";

function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayBefore(dateStr) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() - 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Longest run of consecutive calendar days that are all logged "clean".
function computeBestStreak(entries) {
  const cleanDays = Object.keys(entries)
    .filter((dateStr) => entries[dateStr] === "clean")
    .sort();

  let best = 0;
  let current = 0;
  let prevDate = null;

  for (const dateStr of cleanDays) {
    if (prevDate && dayBefore(dateStr) === prevDate) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
    prevDate = dateStr;
  }

  return best;
}

// Consecutive "clean" days counting back from today. Breaks as soon as a day
// is unlogged or logged as anything other than "clean".
function computeCurrentStreak(entries) {
  let streak = 0;
  let cursor = todayString();

  while (entries[cursor] === "clean") {
    streak += 1;
    cursor = dayBefore(cursor);
  }

  return streak;
}

export function EntriesProvider({ children }) {
  // { "YYYY-MM-DD": "clean" | "weed" | "alcohol" | "both" }
  const [entries, setEntries] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useRef(false);

  // Load whatever was saved last time, once, on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setEntries(JSON.parse(raw));
        }
      } catch (err) {
        console.warn("Failed to load saved entries:", err);
      } finally {
        hasHydrated.current = true;
        setIsHydrated(true);
      }
    })();
  }, []);

  // Persist on every change — but only after the initial load has finished,
  // otherwise the empty starting state would overwrite real saved data
  // before it's had a chance to be read back in.
  useEffect(() => {
    if (!hasHydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch((err) => {
      console.warn("Failed to save entries:", err);
    });
  }, [entries]);

  function setEntry(dateStr, state) {
    setEntries((prev) => {
      const next = { ...prev };
      if (state) {
        next[dateStr] = state;
      } else {
        delete next[dateStr]; // no option picked = clear the day
      }
      return next;
    });
  }

  function clearAll() {
    setEntries({});
  }

  const stats = useMemo(() => {
    const dateStrs = Object.keys(entries);
    const cleanDays = dateStrs.filter((d) => entries[d] === "clean").length;
    return {
      cleanDays,
      daysTracked: dateStrs.length,
      bestStreak: computeBestStreak(entries),
      currentStreak: computeCurrentStreak(entries),
    };
  }, [entries]);

  function getMonthCounts(monthStr) {
    // monthStr like "2025-03"
    const counts = { clean: 0, weed: 0, alcohol: 0, both: 0 };
    let loggedDays = 0;
    for (const [dateStr, state] of Object.entries(entries)) {
      if (dateStr.startsWith(monthStr)) {
        counts[state]++;
        loggedDays++;
      }
    }
    return { counts, loggedDays };
  }

  const value = {
    entries,
    setEntry,
    clearAll,
    stats,
    getMonthCounts,
    isHydrated,
  };

  return (
    <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
  );
}

export function useEntries() {
  const ctx = useContext(EntriesContext);
  if (!ctx) {
    throw new Error("useEntries must be used within an EntriesProvider");
  }
  return ctx;
}
