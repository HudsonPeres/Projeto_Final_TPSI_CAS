import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { requestOTP, verifyOTP } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      await requestOTP(email, "login", password);
      setStep("otp");
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao solicitar OTP";
      const errMsg =
        error.response?.data?.message || error.message || "Erro de rede";
      Alert.alert("Erro", errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Erro", "Insira o código OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(email, otp, "login");
    } catch (error) {
      const msg = error.response?.data?.message || "Código inválido";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {step === "credentials" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "A enviar..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Não tem conta? Registe-se</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.link}>Esqueceu a password?</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.info}>
            Introduza o código enviado para {email}
          </Text>
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
            <Text style={styles.buttonText}>
              {loading ? "Verificando..." : "Confirmar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep("credentials")}>
            <Text style={styles.link}>Voltar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#007AFF", textAlign: "center", marginTop: 12 },
  info: { marginBottom: 12, textAlign: "center" },
});
