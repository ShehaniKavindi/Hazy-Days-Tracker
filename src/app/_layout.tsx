import { Stack } from "expo-router";
import { SettingsProvider } from "@/context/SettingsContext";
import { EntriesProvider } from "@/context/EntriesContext";
import { ProfileProvider } from "@/context/ProfileContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <EntriesProvider>
        <ProfileProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="edit-profile"
              options={{
                headerShown: true,
                title: "Edit profile",
                presentation: "modal",
              }}
            />
          </Stack>
        </ProfileProvider>
      </EntriesProvider>
    </SettingsProvider>
  );
}