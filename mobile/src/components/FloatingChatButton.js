import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { useChatbot } from "../contexts/ChatbotContext";

export default function FloatingChatButton() {
  const { showChatbot } = useChatbot();

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={showChatbot}
      activeOpacity={0.8}
    >
      <Image
        source={require("../../assets/MarIA.png")} // ajuste para o seu ícone
        style={styles.fabIcon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 90,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#43a047",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  fabIcon: {
    width: 38,
    height: 38,
  },
});
