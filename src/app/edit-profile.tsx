import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useProfile, AVATAR_OPTIONS } from "@/context/ProfileContext";
import { useSettings } from "@/context/SettingsContext";

const colors = {
  page: "#F7F8F4",
  card: "#FFFFFF",
  textPrimary: "#243B28",
  textMuted: "#7C8878",
  accent: "#8FC79D",
};

export default function EditProfile() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const { accentColor } = useSettings();

  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname);
  const [goalNote, setGoalNote] = useState(profile.goalNote);
  const [avatarId, setAvatarId] = useState(profile.avatarId);

  function handleSave() {
    updateProfile({
      name: name.trim() || "Alex",
      nickname: nickname.trim(),
      goalNote: goalNote.trim(),
      avatarId,
    });
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Avatar</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setAvatarId(option.id)}
              style={[
                styles.avatarOption,
                avatarId === option.id && { borderColor: accentColor },
              ]}
            >
              <Image
                source={option.image}
                style={styles.avatarOptionImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Nickname for mood messages</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Optional — e.g. babe, champ, superstar"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Goal / note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={goalNote}
          onChangeText={setGoalNote}
          placeholder="Optional — what are you working toward?"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: accentColor }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.page },
  scrollContent: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 20,
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  avatarOption: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
  },
  avatarOptionImage: {
    width: "100%",
    height: "100%",
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  cancelButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: { fontSize: 14, color: colors.textMuted },
});
