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
  Modal,
} from "react-native";
import { useChatbot } from "../contexts/ChatbotContext";

const { height } = Dimensions.get("window");

// Modelo atualizado para gemini-2.5-flash-lite
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const SYSTEM_PROMPT = `És a MarIA, a assistente virtual do Viva Portugal, uma plataforma de turismo rural.
O teu objetivo é ajudar os utilizadores a descobrir experiências autênticas em Portugal: vindimas, passeios de bicicleta, produção de azeite, caminhadas, etc.
Responde sempre em português, adaptando ao que o utilizador falar, se for portuguÊs do brasil, deverá responder igual, se for português de portugal, deverá ser da mesma forma, de forma calorosa, útil e turística.
Se te perguntarem algo fora do contexto do turismo rural português, guia a conversa de volta para as experiências disponíveis na plataforma.
- Responde de forma breve (máximo 3 frases), a não ser que estejas a listar resultados.
- **NUNCA** (absolutamente nunca) incluas links externos (ex: Google Maps, Wikipedia, sites de terceiros). Apenas usa os links que estão nos dados da pesquisa, se fornecidos (todos começam com /place/).`;

export default function ChatbotModal() {
  const { visible, hideChatbot, messages, setMessages } = useChatbot();
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

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave da API Gemini não configurada.");
      }

      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: { text: SYSTEM_PROMPT } },
          contents: [
            ...history,
            { role: "user", parts: [{ text: userMsg.text }] },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error("Falha na comunicação com a MarIA.");
      }

      const data = await response.json();
      const botText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Desculpe, ocorreu um erro. Pode tentar novamente?";

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch (error) {
      console.error("Chatbot error:", error);
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
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={hideChatbot}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            {/* Cabeçalho */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>MarIA</Text>
              <TouchableOpacity onPress={hideChatbot}>
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
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    justifyContent: "flex-end",
  },
  modalContent: {
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
