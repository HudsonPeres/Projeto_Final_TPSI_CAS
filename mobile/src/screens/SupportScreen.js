import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suporte</Text>
      <Text style={styles.text}>
        Em breve poderá contactar o suporte através deste ecrã.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fefefe",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1b1b1b",
  },
  text: { fontSize: 16, color: "#666" },
});
