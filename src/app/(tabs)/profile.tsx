import { Text, View, SafeAreaView, StyleSheet } from "react-native";

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8F4" },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "500", color: "#243B28" },
});