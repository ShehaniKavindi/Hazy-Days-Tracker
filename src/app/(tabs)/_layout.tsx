import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#8FC79D" },
        headerTintColor: "#FFFFFF",
        tabBarActiveTintColor: "#2F6B3E",
        tabBarInactiveTintColor: "#A2AC9C",
        tabBarStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      
      <Tabs.Screen
        name="index"
        options={{
            headerTitle: "Hazy Days Tracking",
            headerTitleAlign: "center",
            headerTitleStyle: {
            fontSize: 22,
            fontWeight: "600",
            },
            tabBarLabel: "Calendar",
            tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
            ),
        }}
        />
        <Tabs.Screen
        name="profile"
        options={{
            headerTitle: "Hazy Days Tracking",
            headerTitleAlign: "center",
            headerTitleStyle: {
            fontSize: 22,
            fontWeight: "600",
            },
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
            ),
        }}
        />
      <Tabs.Screen
        name="settings"
        options={{
            headerTitle: "Hazy Days Tracking",
            headerTitleAlign: "center",
            headerTitleStyle: {
            fontSize: 22,
            fontWeight: "600",
            },
            tabBarLabel: "Settings",
            tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
            ),
        }}
        />
    </Tabs>
  );
}