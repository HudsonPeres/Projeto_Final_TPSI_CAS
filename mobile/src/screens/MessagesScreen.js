import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mensagens</Text>
      <Text style={styles.text}>Em breve.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fefefe",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  text: { color: "#666" },
});
