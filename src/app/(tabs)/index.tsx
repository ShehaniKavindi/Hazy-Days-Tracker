import { useState } from "react";
import { Text, View, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";

const colors = {
  page: "#F7F8F4",
  card: "#FFFFFF",
  textPrimary: "#243B28",
  textMuted: "#7C8878",
  clean: { bg: "#F1F7EA", text: "#5C6B58" },
  weed: { bg: "#CDEBCF", text: "#2F6B3E" },
  alcohol: { bg: "#FBDFB8", text: "#96591C" },
  both: { bg: "#F3CDC6", text: "#9C4A3D" },
  today: { bg: "#FBE4EC", text: "#B5537D" },
};

const OPTIONS = [
  { key: "clean", label: "Clean" },
  { key: "weed", label: "Weed" },
  { key: "alcohol", label: "Alcohol" },
  { key: "both", label: "Both" },
];

function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateLabel(dateStr) {
  // dateStr like "2026-08-23" -> "Sunday, August 23"
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function Index() {
  const router = useRouter();
  const [entries, setEntries] = useState({});
  const [visibleMonth, setVisibleMonth] = useState(todayString().slice(0, 7));

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [draftState, setDraftState] = useState(null);

  function openModalFor(dateStr) {
    setSelectedDate(dateStr);
    setDraftState(entries[dateStr] || null); // pre-select existing state, if any
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedDate(null);
    setDraftState(null);
  }

  function confirmLog() {
    if (!selectedDate) return;
    setEntries((prev) => {
      const next = { ...prev };
      if (draftState) {
        next[selectedDate] = draftState;
      } else {
        delete next[selectedDate]; // no option picked = clear the day
      }
      return next;
    });
    closeModal();
  }

  const markedDates = {};
  for (const [dateStr, state] of Object.entries(entries)) {
    markedDates[dateStr] = {
      customStyles: {
        container: { backgroundColor: colors[state].bg, borderRadius: 9 },
        text: { color: colors[state].text, fontWeight: "500" },
      },
    };
  }

  const today = todayString();
  if (!markedDates[today]) {
    markedDates[today] = {
      customStyles: {
        container: { backgroundColor: colors.today.text, borderRadius: 40 },
        text: { color: colors.today.bg, fontWeight: "600" },
      },
    };
  }

  const counts = { clean: 0, weed: 0, alcohol: 0, both: 0 };
  let loggedDays = 0;
  for (const [dateStr, state] of Object.entries(entries)) {
    if (dateStr.startsWith(visibleMonth)) {
      counts[state]++;
      loggedDays++;
    }
  }

  const problemDays = counts.weed + counts.alcohol + counts.both;
  const ratio = loggedDays === 0 ? 0 : problemDays / loggedDays;
  let verdictTag = "No data yet";
  let verdictColor = colors.textMuted;
  let verdictMessage = "Nothing logged for this month yet.";
  if (loggedDays > 0) {
    if (ratio <= 0.2) {
      verdictTag = "Mostly clean";
      verdictColor = colors.clean.text;
    } else if (ratio <= 0.5) {
      verdictTag = "Mixed month";
      verdictColor = colors.alcohol.text;
    } else {
      verdictTag = "Heavier month";
      verdictColor = colors.both.text;
    }
    verdictMessage = `${counts.clean} of ${loggedDays} logged days were clean this month.`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.heading}>
          <View>
            <Text style={styles.headingText}>Hazy Days Tracking</Text>
            <Text style={styles.subText}>Tap a day to log</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Calendar
            current={todayString()}
            markingType="custom"
            markedDates={markedDates}
            onDayPress={(day) => openModalFor(day.dateString)}
            onMonthChange={(month) => setVisibleMonth(month.dateString.slice(0, 7))}
            theme={{
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textMuted,
              dayTextColor: colors.textPrimary,
              textDisabledColor: "#D8DED9",
              todayTextColor: colors.weed.text,
              monthTextColor: colors.textPrimary,
              arrowColor: colors.weed.text,
              textDayFontWeight: "400",
              textMonthFontWeight: "500",
              textDayHeaderFontWeight: "500",
              textMonthFontSize: 15,
              textDayHeaderFontSize: 11,
              textDayFontSize: 13,
            }}
            style={styles.calendar}
          />

          <View style={styles.legend}>
            <LegendItem color={colors.clean.bg} label="clean" outline />
            <LegendItem color={colors.weed.bg} label="weed" />
            <LegendItem color={colors.alcohol.bg} label="alcohol" />
            <LegendItem color={colors.both.bg} label="both" />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard num={counts.clean} label="clean days" color={colors.clean.text} />
          <StatCard num={counts.weed} label="weed days" color={colors.weed.text} />
          <StatCard num={counts.alcohol} label="alcohol days" color={colors.alcohol.text} />
          <StatCard num={counts.both} label="both" color={colors.both.text} />
        </View>

        <View style={styles.verdictCard}>
          <View style={[styles.verdictTag, { backgroundColor: verdictColor + "22" }]}>
            <Text style={[styles.verdictTagText, { color: verdictColor }]}>{verdictTag}</Text>
          </View>
          <Text style={styles.verdictMessage}>{verdictMessage}</Text>
        </View>

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => openModalFor(todayString())}
        >
          <Text style={styles.logButtonText}>Log today</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log this day</Text>
            {selectedDate && (
              <Text style={styles.modalDate}>{formatDateLabel(selectedDate)}</Text>
            )}

            <View style={styles.optionList}>
              {OPTIONS.map((opt) => {
                const selected = draftState === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionRow,
                      selected && {
                        backgroundColor: colors[opt.key].bg,
                        borderColor: colors[opt.key].text,
                      },
                    ]}
                    onPress={() => setDraftState(opt.key)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected
                          ? { backgroundColor: colors[opt.key].text }
                          : styles.checkboxEmpty,
                      ]}
                    >
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmLog}>
                <Text style={styles.confirmButtonText}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LegendItem({ color, label, outline }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
          outline && styles.legendDotOutline,
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function StatCard({ num, label, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNum, { color }]}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.page },
  heading: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 12,
  },
  headingText: { fontSize: 26, fontWeight: "bold", color: "#5d8366" },
  subText: { fontSize: 16, color: "#7d7f7c" },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingBottom: 16,
    overflow: "hidden",
    marginTop: 4,
  },
  calendar: { borderRadius: 20 },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendDotOutline: { borderWidth: 1, borderColor: "#D8DED9" },
  legendLabel: { fontSize: 12, color: colors.textMuted },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    width: "47%",
  },
  statNum: { fontSize: 22, fontWeight: "500" },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  verdictCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
  },
  verdictTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
  },
  verdictTagText: { fontSize: 12, fontWeight: "500" },
  verdictMessage: { fontSize: 13, color: "#4C5C48" },
  logButton: {
    backgroundColor: "#8FC79D",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  logButtonText: { fontSize: 14, fontWeight: "500", color: "#fff" },

  // Modal styles
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(36,59,40,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: { fontSize: 16, fontWeight: "500", color: colors.textPrimary },
  modalDate: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 16 },
  optionList: { gap: 8, marginBottom: 18 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E4E7DF",
    backgroundColor: "#FFFFFF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxEmpty: { borderWidth: 1.5, borderColor: "#C9D2C2" },
  checkmark: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },
  optionLabel: { fontSize: 14, color: "#3C4A38" },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E4E7DF",
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 14, fontWeight: "500", color: colors.textMuted },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#8FC79D",
    alignItems: "center",
  },
  confirmButtonText: { fontSize: 14, fontWeight: "500", color: "#FFFFFF" },
});