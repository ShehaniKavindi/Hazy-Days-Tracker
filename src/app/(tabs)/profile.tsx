import { Text, View, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";

const colors = {
  page: "#F7F8F4",
  card: "#FFFFFF",
  textPrimary: "#243B28",
  textMuted: "#7C8878",
};

// Placeholder stats until entries are lifted into shared state.
const stats = {
  cleanDays: 42,
  bestStreak: 14,
  currentStreak: 7,
  daysTracked: 61,
};

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Image
            source={require("@/assets/images/weed.jpg")}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.name}>Alex</Text>
          <Text style={styles.subText}>Tracking since March 2025</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard num={stats.cleanDays} label="clean days" color="#2F6B3E" />
          <StatCard num={stats.bestStreak} label="best streak" color="#B5537D" />
          <StatCard num={stats.currentStreak} label="current streak" color="#96591C" />
          <StatCard num={stats.daysTracked} label="days tracked" color="#9C4A3D" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This month</Text>
          <View style={styles.monthCard} />
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: { paddingBottom: 24 },

  avatarSection: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 4,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: 10,
  },
  name: { fontSize: 24, fontWeight: "500", color: "#2F6B3E" },
  subText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    width: "47%",
  },
  statNum: { fontSize: 20, fontWeight: "500" },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  section: { marginTop: 22, marginHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
    marginLeft: 4,
  },
  monthCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    minHeight: 220,
  },

  editButton: {
    backgroundColor: "#8FC79D",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  editButtonText: { fontSize: 14, fontWeight: "500", color: "#fff" },
});
