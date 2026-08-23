import { Stack } from "expo-router";
import { SettingsProvider } from "@/context/SettingsContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SettingsProvider>
  );
}