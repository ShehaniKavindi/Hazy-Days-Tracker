import { Text, View, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEntries } from "@/context/EntriesContext";
import { useProfile, getAvatarImage } from "@/context/ProfileContext";

const colors = {
  page: "#F7F8F4",
  card: "#FFFFFF",
  textPrimary: "#243B28",
  textMuted: "#7C8878",
};

function currentMonthString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MIN_DAYS_FOR_MOOD = 3;

const WAITING_MOOD = {
  level: "waiting",
  image: require("@/assets/images/emoticons/waiting.jpg"),
  message:
    "Hii~ I don't have enough to go on yet.\n\nLog at least 3 days this month and I'll let you know how you're doing <3",
};

const MOODS = [
  {
    level: "good",
    minRatio: 0.8,
    image: require("@/assets/images/emoticons/happy.jpg"),
    message:
      "Awww, look at youuu\nI'm so proud of you!\n\nYou've been doing so well.\nKeep going like this <3",
  },
  {
    level: "mid",
    minRatio: 0.5,
    image: require("@/assets/images/emoticons/try harder.jpg"),
    message:
      "Okayyy… we can do better than this. \n\n Don't give up now. Try a little harder. \n\n I believe in you <3 ",
  },
  {
    level: "disappointed",
    minRatio: 0.2,
    image: require("@/assets/images/emoticons/dissapointed.jpg"),
    message:
      "Umm… excuse me?? \nI'm actually disappointed in you. You know you can do better than this. I'm not giving up on you, but you seriously need to try harder. I'm watching you",
  },
  {
    level: "ultimate",
    minRatio: 0,
    image: require("@/assets/images/emoticons/sad.jpg"),
    message:
      "Yyyyyyyyyy…  What are we DOING here, sir??\n I'm so disappointed in you. \nYou better behave and make me proud, okay? \n No more excuses.",
  },
];

function getMood(cleanRatio) {
  return MOODS.find((m) => cleanRatio >= m.minRatio) ?? MOODS[MOODS.length - 1];
}

export default function Profile() {
  const router = useRouter();
  const { stats, getMonthCounts } = useEntries();
  const { profile } = useProfile();

  const { counts, loggedDays } = getMonthCounts(currentMonthString());
  const cleanRatio = loggedDays > 0 ? counts.clean / loggedDays : 1;
  const mood = loggedDays < MIN_DAYS_FOR_MOOD ? WAITING_MOOD : getMood(cleanRatio);

  // Address the user by their nickname if they set one, without baking it
  // into every message string above.
  const moodMessage = profile.nickname
    ? `${profile.nickname},\n\n${mood.message}`
    : mood.message;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Image
            source={getAvatarImage(profile.avatarId)}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.subText}>Tracking since March 2025</Text>
          {profile.goalNote ? (
            <Text style={styles.goalNote}>{profile.goalNote}</Text>
          ) : null}
        </View>

        <View style={styles.statsGrid}>
          <StatCard num={stats.cleanDays} label="clean days" color="#2F6B3E" />
          <StatCard num={stats.bestStreak} label="best streak" color="#B5537D" />
          <StatCard num={stats.currentStreak} label="current streak" color="#96591C" />
          <StatCard num={stats.daysTracked} label="days tracked" color="#9C4A3D" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This month</Text>
          <View style={styles.monthCard}>
            <Image source={mood.image} style={styles.moodImage} resizeMode="cover" />
            <Text style={styles.moodMessage}>{moodMessage}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        >
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
  goalNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    marginHorizontal: 32,
    textAlign: "center",
    fontStyle: "italic",
  },

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
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    minHeight: 120,
  },
  moodImage: {
    width: 150,
    height: 150,
    borderRadius: 42,
  },
  moodMessage: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMuted,
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
