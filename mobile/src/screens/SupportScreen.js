import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const COLORS = {
  primary: "#e53935",
  accent: "#4a90e2",
  backgroundLight: "#fefefe",
  textLight: "#1b1b1b",
  border: "#e0e0e0",
  cardBackground: "#ffffff",
  success: "#43a047",
};

export default function SupportScreen() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDemands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/demands/my");
      setDemands(res.data);
    } catch (error) {
      // silencioso; pode não ter demandas
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDemands();
    }, [fetchDemands]),
  );

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Erro", "Preencha o assunto e a mensagem.");
      return;
    }
    setSending(true);
    try {
      await api.post("/demands", {
        subject: subject.trim(),
        message: message.trim(),
      });
      Alert.alert("Obrigado", "A sua mensagem foi enviada para o suporte.");
      setSubject("");
      setMessage("");
      fetchDemands(); // atualiza a lista
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao enviar pedido.";
      Alert.alert("Erro", msg);
    } finally {
      setSending(false);
    }
  };

  const renderDemand = ({ item }) => (
    <View style={styles.demandCard}>
      <View style={styles.demandHeader}>
        <Text style={styles.demandSubject} numberOfLines={1}>
          {item.subject}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "open" ? COLORS.accent : COLORS.success,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "open" ? "Aberto" : "Resolvido"}
          </Text>
        </View>
      </View>
      <Text style={styles.demandMessage} numberOfLines={3}>
        {item.message}
      </Text>
      <Text style={styles.demandDate}>
        {new Date(item.createdAt).toLocaleDateString("pt-PT")}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.header}>Suporte</Text>

      {/* Formulário de nova demanda */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Nova Mensagem</Text>
        <TextInput
          style={styles.input}
          placeholder="Assunto"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o seu problema..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Histórico de demandas */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>As Minhas Mensagens</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <FlatList
            data={demands}
            renderItem={renderDemand}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Ainda não enviou nenhuma mensagem.
              </Text>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 20,
  },
  form: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    minHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 4,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  historyContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 12,
  },
  demandCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  demandHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  demandSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textLight,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  demandMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  demandDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
