import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import DismissKeyboardView from "../components/DismissKeyboardView";
import api from "../services/api";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPassword) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      Alert.alert(
        "Sucesso",
        "Palavra-passe alterada com sucesso. Já pode fazer login.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }],
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
    <DismissKeyboardView>
      <View style={styles.container}>
        <Text style={styles.title}>Nova Password</Text>
        <Text style={styles.subtitle}>
          Introduza o código enviado para {email} e a nova password.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Código OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Nova password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Alterando..." : "Alterar password"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Voltar ao login</Text>
        </TouchableOpacity>
      </View>
    </DismissKeyboardView>
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
