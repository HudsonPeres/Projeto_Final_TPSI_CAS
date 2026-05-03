import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import api from "../services/api"; // usamos axios já configurado

const { height } = Dimensions.get("window");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `És a MarIA, a assistente virtual do Viva Portugal, uma plataforma de turismo rural.
O teu objetivo é ajudar os utilizadores a descobrir experiências autênticas em Portugal: vindimas, passeios de bicicleta, produção de azeite, caminhadas, etc.
Responde sempre em português de Portugal, de forma calorosa, útil e turística.
Se te perguntarem algo fora do contexto do turismo rural português, guia a conversa de volta para as experiências disponíveis na plataforma. Se pedirem algum link, não forneça nada que leve para fora da aplicação`;

export default function ChatbotModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Olá! 👋 Sou a MarIA, a sua assistente virtual. Em que posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "system")
        .slice(-10)
        .map((m) => ({
          role: m.role === "bot" ? "model" : "user",
          parts: [{ text: m.text }],
        }));

      const response = await api.post(
        `${GEMINI_URL}?key=${Constants.expoConfig.extra.GEMINI_API_KEY}`,
        {
          system_instruction: { parts: { text: SYSTEM_PROMPT } },
          contents: [
            ...history,
            { role: "user", parts: [{ text: userMsg.text }] },
          ],
        },
      );

      const botText =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Desculpe, ocorreu um erro. Pode tentar novamente?";

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Oops! Não consegui responder. Verifique a sua ligação e tente outra vez.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MarIA</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Mensagens */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escreva a sua mensagem..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || loading) && { opacity: 0.5 },
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    height: height * 0.65,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b1b1b",
  },
  closeButton: {
    fontSize: 20,
    color: "#e53935",
    fontWeight: "bold",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e1f5fe",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#1b1b1b",
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#e53935",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
