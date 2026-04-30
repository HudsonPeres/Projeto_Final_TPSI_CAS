import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import api from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert("Erro", "Por favor, insira o email.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      Alert.alert(
        "Sucesso",
        "Código enviado para o email. Válido por 10 minutos.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("ResetPassword", { email }),
          },
        ],
      );
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Erro de rede";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Password</Text>
      <Text style={styles.subtitle}>
        Insira o seu email para receber um código de verificação.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "A enviar..." : "Enviar código"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 10, textAlign: "center" },
  subtitle: { marginBottom: 20, textAlign: "center", color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#e53935",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#007AFF", textAlign: "center", marginTop: 12 },
});
