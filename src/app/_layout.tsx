import { Stack } from "expo-router";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { EntriesProvider } from "@/context/EntriesContext";
import { ProfileProvider } from "@/context/ProfileContext";

function RootStack() {
  const { colors } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.page },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: true,
          title: "Edit profile",
          presentation: "modal",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.textPrimary,
        }}
      />
      <Stack.Screen name="summary" options={{ headerShown: true, title: "Summary" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <EntriesProvider>
        <ProfileProvider>
          <RootStack />
        </ProfileProvider>
      </EntriesProvider>
    </SettingsProvider>
  );
}
