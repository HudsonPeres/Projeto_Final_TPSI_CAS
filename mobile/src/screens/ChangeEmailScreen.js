import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";
import BackButton from "../components/BackButton";

export default function ChangeEmailScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = pedir OTP, 2 = verificar OTP
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Erro", "Insira o novo email.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/request-otp", {
        email: newEmail.trim(),
        type: "change_email",
      });
      setStep(2);
      Alert.alert("Código enviado", `Enviamos um código para ${newEmail}`);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao solicitar OTP.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert("Erro", "Insira o código OTP.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email: newEmail.trim(),
        otp: otp.trim(),
        type: "change_email",
        newEmail: newEmail.trim(),
      });
      Alert.alert("Sucesso", "Email alterado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Código inválido.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Alterar Email</Text>
      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Novo email"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar código</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Código OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirmar</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fefefe",
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1b1b1b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
