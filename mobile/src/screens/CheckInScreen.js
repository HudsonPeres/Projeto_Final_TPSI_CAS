import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import api from "../services/api";
import BackButton from "../components/BackButton";

export default function CheckInScreen({ navigation }) {
  const [mode, setMode] = useState("menu");
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [code, setCode] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "qr") {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
        if (status !== "granted") {
          Alert.alert(
            "Permissão negada",
            "Precisa de permitir a câmara para ler QR codes.",
          );
          setMode("menu");
        }
      })();
    }
  }, [mode]);

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setCode(data);
      searchBooking(data);
    }
  };

  const searchBooking = async (bookingCode) => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/search?code=${bookingCode}`);
      if (res.data) {
        setBooking(res.data);
        setMode("confirm");
      }
    } catch (error) {
      Alert.alert("Erro", "Código de reserva não encontrado.");
      setMode("menu");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!code.trim()) {
      Alert.alert("Erro", "Insira o código da reserva.");
      return;
    }
    searchBooking(code.trim());
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      await api.patch(`/bookings/${booking._id}/checkin`, {
        code: booking.bookingCode,
      });
      Alert.alert("Sucesso", "Check-in realizado com sucesso!");
      setMode("menu");
      setBooking(null);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao fazer check-in.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      await api.patch(`/bookings/${booking._id}/checkout`);
      Alert.alert("Sucesso", "Check-out realizado com sucesso!");
      setMode("menu");
      setBooking(null);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao fazer check-out.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "qr") {
    if (hasPermission === null) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (hasPermission === false) {
      return (
        <View style={styles.centered}>
          <Text>Sem acesso à câmara</Text>
          <TouchableOpacity onPress={() => setMode("menu")}>
            <Text style={styles.link}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.cameraOverlay}>
            <Text style={styles.scanHint}>Aponte para o QR code</Text>
            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainText}>Ler novamente</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setMode("menu");
                setScanned(false);
              }}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  if (mode === "confirm" && booking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Confirmar Check-in</Text>
        <Text style={styles.info}>Reserva: {booking.place?.title}</Text>
        <Text style={styles.info}>Código: {booking.bookingCode}</Text>
        <Text style={styles.info}>Estado atual: {booking.status}</Text>
        {booking.status === "confirmed" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCheckIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Fazer Check-in</Text>
            )}
          </TouchableOpacity>
        )}
        {booking.status === "checked_in" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCheckOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Fazer Check-out</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            setMode("menu");
            setBooking(null);
          }}
        >
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton />
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.title}>Gestão de Check-in</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMode("qr")}
        >
          <Text style={styles.menuButtonText}>Ler QR Code</Text>
        </TouchableOpacity>
        <View style={styles.manualContainer}>
          <TextInput
            style={styles.input}
            placeholder="Código da reserva"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleManualSubmit}
          >
            <Text style={styles.menuButtonText}>
              Inserir código manualmente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
    paddingTop: 60,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fefefe",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#1b1b1b",
  },
  menuButton: {
    backgroundColor: "#e53935",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  menuButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  manualContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 12,
    width: "80%",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  scanHint: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanAgainButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  scanAgainText: { color: "#e53935", fontWeight: "bold" },
  closeButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeButtonText: { color: "#333", fontWeight: "bold" },
  actionButton: {
    backgroundColor: "#e53935",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 20,
  },
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  info: { fontSize: 18, marginBottom: 10, color: "#1b1b1b" },
  link: { color: "#4a90e2", fontSize: 16, marginTop: 20 },
});
