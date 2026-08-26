import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useSettings, ACCENTS } from "@/context/SettingsContext";
import { useEntries } from "@/context/EntriesContext";

const colors = {
  page: "#F7F8F4",
  card: "#FFFFFF",
  textPrimary: "#243B28",
  textMuted: "#7C8878",
  border: "#E4E7DF",
  accentDefault: "#8FC79D",
  danger: "#9C4A3D",
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0-59
const PERIODS = ["AM", "PM"];

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function pad2(n) {
  return String(n).padStart(2, "0");
}

export default function Settings() {
  const { weekStart, setWeekStart, accent, setAccent, accentColor, headingColor } = useSettings();
  const { entries, clearAll } = useEntries();

  const [reminderOn, setReminderOn] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [reminderPeriod, setReminderPeriod] = useState("PM");
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  const reminderTime = `${reminderHour}:${pad2(reminderMinute)} ${reminderPeriod}`;

  function handleExport() {
    const count = Object.keys(entries).length;
    Alert.alert(
      "Export data",
      count === 0
        ? "Nothing to export yet — log a day first."
        : `You have ${count} logged day${count === 1 ? "" : "s"}. File export isn't wired up yet, but your data is safely tracked in the app.`,
    );
  }

  function handleClearAll() {
    Alert.alert(
      "Clear all entries?",
      "This will permanently remove every logged day. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: () => {
            clearAll();
            Alert.alert("Cleared", "All entries have been cleared.");
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heading}>
          <Text style={[styles.headingText, { color: headingColor }]}>Settings</Text>
          <Text style={styles.subText}>Tune how Hazy Days works for you</Text>
        </View>

        {/* Reminders */}
        <Section title="Reminders">
          <Row
            label="Daily log reminder"
            description="Get a nudge if you haven't logged today"
          >
            <Switch
              value={reminderOn}
              onValueChange={setReminderOn}
              trackColor={{ false: "#D8DED9", true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </Row>
          {reminderOn && (
            <TouchableOpacity
              style={styles.subRow}
              onPress={() => setTimeModalVisible(true)}
            >
              <Text style={styles.subRowLabel}>Reminder time</Text>
              <Text style={styles.subRowValue}>{reminderTime} ›</Text>
            </TouchableOpacity>
          )}
        </Section>

        {/* Calendar */}
        <Section title="Calendar">
          <View style={styles.rowStack}>
            <Text style={styles.rowLabel}>Week starts on</Text>
            <View style={styles.segmented}>
              <SegmentButton
                label="Sunday"
                active={weekStart === "sunday"}
                onPress={() => setWeekStart("sunday")}
              />
              <SegmentButton
                label="Monday"
                active={weekStart === "monday"}
                onPress={() => setWeekStart("monday")}
              />
            </View>
          </View>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <View style={styles.rowStack}>
            <Text style={styles.rowLabel}>Accent color</Text>
            <View style={styles.swatchRow}>
              {ACCENTS.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  onPress={() => setAccent(a.key)}
                  style={styles.swatchWrap}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: a.value },
                      accent === a.key && styles.swatchSelected,
                    ]}
                  >
                    {accent === a.key && <Text style={styles.swatchCheck}>✓</Text>}
                  </View>
                  <Text style={styles.swatchLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Row
            label="Dark mode"
            description="Coming soon"
            muted
          >
            <Switch value={false} disabled trackColor={{ false: "#D8DED9", true: "#D8DED9" }} />
          </Row>
        </Section>

        {/* Data */}
        <Section title="Data">
          <TouchableOpacity style={styles.dataButton} onPress={handleExport}>
            <Text style={styles.dataButtonText}>Export data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataButton, styles.dataButtonDanger]}
            onPress={handleClearAll}
          >
            <Text style={[styles.dataButtonText, styles.dataButtonDangerText]}>
              Clear all entries
            </Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>

      {/* Reminder time picker */}
      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reminder time</Text>

            <View style={styles.wheelRow}>
              <WheelColumn
                items={HOURS}
                selected={reminderHour}
                onChange={setReminderHour}
                format={(n) => String(n)}
              />
              <Text style={styles.wheelColon}>:</Text>
              <WheelColumn
                items={MINUTES}
                selected={reminderMinute}
                onChange={setReminderMinute}
                format={pad2}
              />
              <WheelColumn
                items={PERIODS}
                selected={reminderPeriod}
                onChange={setReminderPeriod}
                format={(p) => p}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: accentColor }]}
              onPress={() => setTimeModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function WheelColumn({ items, selected, onChange, format }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Snap to the current value when the modal opens.
    const index = items.indexOf(selected);
    if (index >= 0) {
      scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMomentumEnd(e) {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    onChange(items[clamped]);
  }

  return (
    <View style={styles.wheelColumn}>
      <View pointerEvents="none" style={styles.wheelHighlight} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        style={{ height: PICKER_HEIGHT }}
      >
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              key={String(item)}
              style={styles.wheelItem}
              onPress={() => {
                onChange(item);
                const index = items.indexOf(item);
                scrollRef.current?.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true,
                });
              }}
            >
              <Text
                style={[
                  styles.wheelItemText,
                  isSelected && styles.wheelItemTextSelected,
                ]}
              >
                {format(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, description, children, muted }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, muted && styles.rowLabelMuted]}>{label}</Text>
        {description && <Text style={styles.rowDescription}>{description}</Text>}
      </View>
      {children}
    </View>
  );
}

function SegmentButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.page },
  scrollContent: { paddingBottom: 24 },
  heading: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 12,
  },
  headingText: { fontSize: 25, fontWeight: "500", color: "#5d8366" },
  subText: { fontSize: 14, color: "#7d7f7c" },

  section: { marginTop: 10, marginHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 14, fontWeight: "500", color: colors.textPrimary },
  rowLabelMuted: { color: colors.textMuted },
  rowDescription: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingLeft: 14,
    borderTopWidth: 1,
    borderTopColor: "#F0F2EC",
  },
  subRowLabel: { fontSize: 13, color: colors.textMuted },
  subRowValue: { fontSize: 13, fontWeight: "500", color: colors.textPrimary },

  rowStack: { paddingVertical: 12 },
  segmented: {
    flexDirection: "row",
    backgroundColor: "#F1F3EE",
    borderRadius: 10,
    padding: 3,
    marginTop: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentButtonActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  segmentTextActive: { color: colors.textPrimary },

  swatchRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  swatchWrap: { alignItems: "center", gap: 4 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: { borderWidth: 2, borderColor: colors.textPrimary },
  swatchCheck: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },
  swatchLabel: { fontSize: 11, color: colors.textMuted },

  dataButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  dataButtonText: { fontSize: 14, fontWeight: "500", color: colors.textPrimary },
  dataButtonDanger: {
    borderTopWidth: 1,
    borderTopColor: "#F0F2EC",
  },
  dataButtonDangerText: { color: colors.danger },

  // Modal styles (matches calendar screen)
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
  modalTitle: { fontSize: 16, fontWeight: "500", color: colors.textPrimary, marginBottom: 14 },

  wheelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  wheelColumn: {
    width: 64,
    height: PICKER_HEIGHT,
    justifyContent: "center",
  },
  wheelHighlight: {
    position: "absolute",
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#F1F7EA",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelItemText: { fontSize: 16, color: colors.textMuted },
  wheelItemTextSelected: { fontSize: 18, fontWeight: "600", color: colors.textPrimary },
  wheelColon: { fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginHorizontal: 2 },

  confirmButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.accentDefault,
    alignItems: "center",
  },
  confirmButtonText: { fontSize: 14, fontWeight: "500", color: "#FFFFFF" },
});
