import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";

const COLORS = {
  primary: "#e53935",
  accent: "#4a90e2",
  backgroundLight: "#fefefe",
  textLight: "#1b1b1b",
  systemMessage: "#888",
  bubbleMe: "#e1f5fe",
  bubbleOther: "#f5f5f5",
  cardBackground: "#ffffff",
};

export default function ConversationScreen({ route, navigation }) {
  const { conversationId, otherUserName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const flatListRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(
        `/chat/conversations/${conversationId}/messages`,
      );
      setMessages(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/conversations/${conversationId}/messages`, {
        text: inputText.trim(),
      });
      setInputText("");
      fetchMessages();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender && item.sender._id === user._id;
    const isSystem = item.isSystem;

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {!isMine && (
          <Text style={styles.senderName}>
            {item.sender?.name || "Utilizador"}
          </Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {new Date(item.createdAt).toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.side}>
          <BackButton />
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {otherUserName || "Chat"}
        </Text>

        <View style={styles.side} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escreva uma mensagem..."
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && { opacity: 0.5 },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>{sending ? "…" : "Enviar"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  side: {
    width: 60,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
    flex: 1,
    textAlign: "center",
  },

  messagesList: { paddingHorizontal: 16, paddingBottom: 8 },
  systemMessage: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemText: {
    fontSize: 13,
    color: COLORS.systemMessage,
    fontStyle: "italic",
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.bubbleMe,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.bubbleOther,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  timeText: {
    fontSize: 11,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
