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
import { useAuth } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";

export default function ChangePasswordScreen({ navigation }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Erro", "Insira a nova palavra-passe.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/request-otp", {
        email: user.email,
        type: "change_password",
        password: newPassword, // validado no backend
      });
      setStep(2);
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
        email: user.email,
        otp: otp.trim(),
        type: "change_password",
        newPassword: newPassword.trim(),
      });
      Alert.alert("Sucesso", "Palavra-passe alterada com sucesso!", [
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
      <Text style={styles.title}>Alterar Palavra-passe</Text>
      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nova palavra-passe"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
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
