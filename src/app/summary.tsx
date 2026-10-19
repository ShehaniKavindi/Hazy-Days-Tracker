import { useState } from "react";
import { Text, View, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Calendar } from "react-native-calendars";
import { useSettings } from "@/context/SettingsContext";
import { useEntries } from "@/context/EntriesContext";

const colors = {
  page: "#F7F8F4",
  card: "#FFFFFF",
  textPrimary: "#243B28",
  textMuted: "#7C8878",
  weed: { bg: "#CDEBCF", text: "#2F6B3E" },
  alcohol: { bg: "#FBDFB8", text: "#96591C" },
  both: { bg: "#F3CDC6", text: "#9C4A3D" },
};

const PRESETS = [
  { key: "month", label: "This month" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "3 months" },
  { key: "all", label: "All time" },
];

const pad = (n) => String(n).padStart(2, "0");

function toDateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayString() {
  return toDateString(new Date());
}

function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

// Inclusive number of days between two YYYY-MM-DD strings.
function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / 86400000) + 1;
}

function formatShort(dateStr) {
  const d = parseDate(dateStr);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(
    undefined,
    sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" },
  );
}

function presetRange(key, entries) {
  const now = new Date();
  const today = todayString();
  if (key === "month") return [toDateString(new Date(now.getFullYear(), now.getMonth(), 1)), today];
  if (key === "30") return [addDays(today, -29), today];
  if (key === "90") return [toDateString(new Date(now.getFullYear(), now.getMonth() - 2, 1)), today];
  const first = Object.keys(entries).sort()[0];
  return [first ?? today, today];
}

export default function Summary() {
  const { firstDay, accentColor, headingColor, cleanDaysColor, cleanColors } = useSettings();
  const { entries, getRangeCounts } = useEntries();

  const initial = presetRange("month", entries);
  const [preset, setPreset] = useState("month");
  const [start, setStart] = useState(initial[0]);
  const [end, setEnd] = useState(initial[1]); // null while the user is still picking an end date
  const [calMonth, setCalMonth] = useState(initial[1]);
  const [calKey, setCalKey] = useState(0); // bumping this jumps the calendar to calMonth

  function applyPreset(key) {
    const [s, e] = presetRange(key, entries);
    setPreset(key);
    setStart(s);
    setEnd(e);
    setCalMonth(e);
    setCalKey((k) => k + 1);
  }

  function handleDayPress(day) {
    const d = day.dateString;
    setPreset(null);
    if (!start || end) {
      setStart(d);
      setEnd(null);
    } else if (d < start) {
      setEnd(start);
      setStart(d);
    } else {
      setEnd(d);
    }
  }

  const rangeEnd = end ?? start;
  const { counts, loggedDays } = getRangeCounts(start, rangeEnd);
  const totalDays = daysBetween(start, rangeEnd);
  const unlogged = totalDays - loggedDays;
  const weedOnly = counts.weed - counts.both;
  const alcoholOnly = counts.alcohol - counts.both;

  const markedDates = {};
  for (let cursor = start; cursor <= rangeEnd; cursor = addDays(cursor, 1)) {
    const isEdge = cursor === start || cursor === rangeEnd;
    markedDates[cursor] = {
      startingDay: cursor === start,
      endingDay: cursor === rangeEnd,
      color: isEdge ? accentColor : accentColor + "40",
      textColor: isEdge ? "#1F3A25" : colors.textPrimary,
    };
  }

  const segments = [
    { key: "clean", n: counts.clean, color: cleanDaysColor, label: "Clean" },
    { key: "weed", n: weedOnly, color: colors.weed.bg, label: "Weed only" },
    { key: "alcohol", n: alcoholOnly, color: colors.alcohol.bg, label: "Alcohol only" },
    { key: "both", n: counts.both, color: colors.both.bg, label: "Both" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Summary",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: accentColor },
          headerTintColor: "#FFFFFF",
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {PRESETS.map((p) => {
            const active = preset === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => applyPreset(p.key)}
                style={[styles.chip, active && { backgroundColor: accentColor }]}
              >
                <Text style={[styles.chipText, active && { color: "#1F3A25" }]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          <Calendar
            key={calKey}
            current={calMonth}
            firstDay={firstDay}
            markingType="period"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            onMonthChange={(month) => setCalMonth(month.dateString)}
            theme={{
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textMuted,
              dayTextColor: colors.textPrimary,
              textDisabledColor: "#D8DED9",
              todayTextColor: headingColor,
              monthTextColor: colors.textPrimary,
              arrowColor: headingColor,
              textDayFontWeight: "400",
              textMonthFontWeight: "500",
              textDayHeaderFontWeight: "500",
              textMonthFontSize: 15,
              textDayHeaderFontSize: 11,
              textDayFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>
            {start === rangeEnd ? formatShort(start) : `${formatShort(start)} – ${formatShort(rangeEnd)}`}
          </Text>
          <Text style={styles.rangeDays}>{totalDays} {totalDays === 1 ? "day" : "days"}</Text>
        </View>
        {!end && <Text style={styles.hint}>Tap an end date, or leave it for a single day</Text>}

        <View style={styles.statsGrid}>
          <StatCard num={counts.clean} label="clean days" color={cleanColors.text} bg={cleanColors.bg} />
          <StatCard num={counts.weed} label="weed days" color={colors.weed.text} bg={colors.weed.bg} />
          <StatCard num={counts.alcohol} label="alcohol days" color={colors.alcohol.text} bg={colors.alcohol.bg} />
          <StatCard num={counts.both} label="both" color={colors.both.text} bg={colors.both.bg} />
        </View>

        <View style={styles.barCard}>
          <View style={styles.bar}>
            {loggedDays === 0 ? (
              <View style={{ flex: 1, backgroundColor: "#E6EAE3" }} />
            ) : (
              segments.map((s) => s.n > 0 && <View key={s.key} style={{ flex: s.n, backgroundColor: s.color }} />)
            )}
          </View>
          <View style={styles.legend}>
            {segments.map((s) => (
              <View key={s.key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <Text style={styles.legendText}>{s.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.footnote}>
            Logged {loggedDays} of {totalDays} {totalDays === 1 ? "day" : "days"}
            {unlogged > 0 ? ` · ${unlogged} not logged` : ""}
          </Text>
          <Text style={styles.footnote}>Weed and alcohol totals include “both” days.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ num, label, color, bg }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statNum, { color }]}>{num}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.page },
  scrollContent: { paddingBottom: 28 },

  chipRow: { paddingHorizontal: 16, paddingTop: 18, gap: 8 },
  chip: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 13, fontWeight: "500", color: "#4F6B55" },

  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    paddingBottom: 6,
    overflow: "hidden",
  },
  calendar: { borderRadius: 20 },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginHorizontal: 20,
    marginTop: 14,
  },
  rangeLabel: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginTop: 10 },
  rangeDays: { fontSize: 13, color: colors.textMuted },
  hint: { fontSize: 12, color: colors.textMuted, marginHorizontal: 20, marginTop: 4 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: { borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, width: "47.5%" },
  statNum: { fontSize: 26, fontWeight: "600" },
  statLabel: { fontSize: 12, marginTop: 2 },

  barCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
  },
  bar: { flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.textMuted },
  footnote: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
});
