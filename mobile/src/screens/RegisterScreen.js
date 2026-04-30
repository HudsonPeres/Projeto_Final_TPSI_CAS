import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { useAuth } from "../contexts/AuthContext";
import DismissKeyboardView from "../components/DismissKeyboardView";

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen({ navigation }) {
  const { requestOTP, verifyOTP, googleSignIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("data");
  const [loading, setLoading] = useState(false);

  const [googleRequest, googleResponse, promptAsync] =
    Google.useIdTokenAuthRequest({
      iosClientId:
        "155839010735-lqqhkg77soggfeb90kb7bcjaiehp64d3.apps.googleusercontent.com",
      androidClientId:
        "155839010735-h8i389vg6pr922g7c8n4k2ev54igarls.apps.googleusercontent.com",
      webClientId: Constants.expoConfig.extra.GOOGLE_CLIENT_ID,
    });

  // Trata a resposta do Google
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { id_token } = googleResponse.params;
      googleSignIn(id_token).catch((err) =>
        Alert.alert("Erro", "Falha ao criar conta com Google"),
      );
    }
  }, [googleResponse]);

  const handleRequestOTP = async () => {
    if (!name || !email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      await requestOTP(email, "register");
      setStep("otp");
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao solicitar OTP";
      Alert.alert("Erro", msg);
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
      await verifyOTP(email, otp, "register", name, password);
    } catch (error) {
      const msg = error.response?.data?.message || "Código inválido";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  // Componente do ícone Google (SVG igual ao do LoginScreen)
  const GoogleIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  );

  return (
    <DismissKeyboardView>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>

        {step === "data" ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={name}
              onChangeText={setName}
            />
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
                {loading ? "A enviar..." : "Registar"}
              </Text>
            </TouchableOpacity>

            {/* Botão Google */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync({ useProxy: true })}
              disabled={!googleRequest}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>
                Criar conta com Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.link}>Já tem conta? Faça login</Text>
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

            <TouchableOpacity onPress={() => setStep("data")}>
              <Text style={styles.link}>Voltar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </DismissKeyboardView>
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
    backgroundColor: "#e53935",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  link: { color: "#007AFF", textAlign: "center", marginTop: 12 },
  info: { marginBottom: 12, textAlign: "center" },
});
