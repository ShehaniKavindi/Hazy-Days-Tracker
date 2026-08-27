import { useState } from "react";
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProfile } from "@/context/ProfileContext";

const ONBOARDED_KEY = "hazy-days:onboarded";
const SAGE = "#8FC79D";

// Adjust file extensions below if your images aren't .jpg
const STEPS = [
  {
    key: "welcome",
    image: require("@/assets/images/welcome/1.gif"),
    title: "Welcome to Hazy Days",
    body: "Log clean, weed, alcohol, or both days on a simple calendar, and see your monthly patterns at a glance.",
  },
  {
    key: "name",
    image: require("@/assets/images/welcome/2.jpg"),
    title: "What should we call you?",
    body: "We'll use this to personalize your stats and mood messages.",
  },
  {
    key: "ready",
    image: require("@/assets/images/welcome/3.gif"),
    title: "Let's start logging",
    body: "Thanks for choosing Hazy Days — tap a day on the calendar any time to log how it went.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const isNameStep = current.key === "name";

  function handleNext() {
    if (isNameStep) {
      updateProfile({ name: name.trim() || "Idiot" });
    }
    if (isLastStep) {
      finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  }

  async function finishOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    } catch (err) {
      console.warn("Failed to save onboarding status:", err);
    }
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.imageWrap}>
          <View style={styles.imageCircle}>
            <Image source={current.image} style={styles.image} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>

          {isNameStep && (
            <View style={styles.nameBubble}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#A2AC9C"
                autoFocus
              />
            </View>
          )}

          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View key={s.key} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{isLastStep ? "Get started" : "Continue"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SAGE },
  flex: { flex: 1 },
  imageWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageCircle: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  bottomArea: { paddingHorizontal: 28, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "600", color: "#FFFFFF", textAlign: "center", marginBottom: 10 },
  body: { fontSize: 14, color: "#EAF4EC", textAlign: "center", lineHeight: 20 },
  nameBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  nameInput: { fontSize: 16, color: "#243B28", paddingVertical: 10, textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24, marginBottom: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { backgroundColor: "#FFFFFF", width: 18 },
  button: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  buttonText: { fontSize: 15, fontWeight: "600", color: "#2F6B3E" },
});