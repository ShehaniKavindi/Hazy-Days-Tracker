import { Stack } from "expo-router";
import { SettingsProvider } from "@/context/SettingsContext";
import { EntriesProvider } from "@/context/EntriesContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <EntriesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </EntriesProvider>
    </SettingsProvider>
  );
}