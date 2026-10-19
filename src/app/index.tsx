import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "@/context/SettingsContext";

const ONBOARDED_KEY = "hazy-days:onboarded";

export default function StartGate() {
  const { colors } = useSettings();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDED_KEY);
        setOnboarded(value === "true");
      } catch (err) {
        console.warn("Failed to check onboarding status:", err);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.page }]}>
        <ActivityIndicator size="large" color="#8FC79D" />
      </View>
    );
  }

  return <Redirect href={onboarded ? "/(tabs)" : "/onboarding"} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F8F4" },
});