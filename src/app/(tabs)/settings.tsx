import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
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
import { useProfile } from "@/context/ProfileContext";

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
  const {
    weekStart, setWeekStart, accent, setAccent, accentColor, headingColor,
    reminderOn, setReminderOn, reminderHour, reminderMinute, reminderPeriod, updateReminderTime,
  } = useSettings();
  const { entries, setEntry, clearAll } = useEntries();
  const { profile } = useProfile();

  const [timeModalVisible, setTimeModalVisible] = useState(false);

  // Draft time state — the wheel picker edits these freely while open,
  // and we only commit to the real reminder time (and reschedule the
  // notification) when the user taps "Done".
  const [draftHour, setDraftHour] = useState(reminderHour);
  const [draftMinute, setDraftMinute] = useState(reminderMinute);
  const [draftPeriod, setDraftPeriod] = useState(reminderPeriod);

  const reminderTime = `${reminderHour}:${pad2(reminderMinute)} ${reminderPeriod}`;

  function openTimeModal() {
    setDraftHour(reminderHour);
    setDraftMinute(reminderMinute);
    setDraftPeriod(reminderPeriod);
    setTimeModalVisible(true);
  }

  function confirmTimeModal() {
    updateReminderTime(draftHour, draftMinute, draftPeriod);
    setTimeModalVisible(false);
  }

  async function handleExport() {
    try {
      if (Object.keys(entries).length === 0) {
        Alert.alert("Nothing to export yet", "Log a day first, then try exporting.");
        return;
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        profileName: profile.name,
        entries,
      };

      const fileName = `hazy-days-backup-${todayForFilename()}.json`;
      const file = new File(Paths.document, fileName);
      file.write(JSON.stringify(payload, null, 2));

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Sharing isn't available on this device.");
        return;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Export Hazy Days data",
      });
    } catch (err) {
      console.warn("Export failed:", err);
      Alert.alert("Something went wrong exporting your data.");
    }
  }

  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const file = new File(fileUri);
      const content = file.text();
      const parsed = JSON.parse(content);

      // Basic sanity check — is this actually a Hazy Days export?
      if (!parsed.entries || typeof parsed.entries !== "object") {
        Alert.alert("Invalid file", "This doesn't look like a Hazy Days backup file.");
        return;
      }

      const importedCount = Object.keys(parsed.entries).length;

      Alert.alert(
        "Import data?",
        `This file has ${importedCount} logged day${importedCount === 1 ? "" : "s"}. ` +
          "Any dates that overlap with what you've already logged will be overwritten.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: () => {
              for (const [dateStr, state] of Object.entries(parsed.entries)) {
                setEntry(dateStr, state);
              }
              Alert.alert("Imported", `${importedCount} day${importedCount === 1 ? "" : "s"} imported.`);
            },
          },
        ],
      );
    } catch (err) {
      console.warn("Import failed:", err);
      Alert.alert("Something went wrong importing that file.");
    }
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
              onPress={openTimeModal}
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
          <TouchableOpacity style={styles.dataButton} onPress={handleImport}>
            <Text style={styles.dataButtonText}>Import data</Text>
          </TouchableOpacity>

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
                selected={draftHour}
                onChange={setDraftHour}
                format={(n) => String(n)}
              />
              <Text style={styles.wheelColon}>:</Text>
              <WheelColumn
                items={MINUTES}
                selected={draftMinute}
                onChange={setDraftMinute}
                format={pad2}
              />
              <WheelColumn
                items={PERIODS}
                selected={draftPeriod}
                onChange={setDraftPeriod}
                format={(p) => p}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: accentColor }]}
              onPress={confirmTimeModal}
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

function todayForFilename() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

  swatchRow: { flexDirection: "row", flexWrap: "wrap", rowGap: 14, columnGap: 16, marginTop: 12 },
  swatchWrap: { alignItems: "center", gap: 4, width: 40 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: { borderWidth: 2, borderColor: colors.textPrimary },
  swatchCheck: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },
  swatchLabel: { fontSize: 10, color: colors.textMuted, textAlign: "center" },

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