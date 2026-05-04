import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import api from "../services/api";
import BackButton from "../components/BackButton";

const COLORS = {
  primary: "#e53935",
  secondary: "#43a047",
  accent: "#4a90e2",
  backgroundLight: "#fefefe",
  textLight: "#1b1b1b",
  border: "#e0e0e0",
  cardBackground: "#ffffff",
};

const statusLabels = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  checked_in: "Check-in realizado",
  completed: "Concluída",
};

const statusColors = {
  confirmed: COLORS.secondary,
  cancelled: COLORS.primary,
  checked_in: COLORS.accent,
  completed: "#888",
};

const FILTER_OPTIONS = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "completed", label: "Concluídas" },
  { key: "cancelled", label: "Canceladas" },
];

export default function HostBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal de check‑in
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [checkinLoading, setCheckinLoading] = useState(false);

  const scanHandled = useRef(false);

  const fetchHostBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/host");
      setBookings(res.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHostBookings();
    }, [fetchHostBookings]),
  );

  const handleCancel = (bookingId) => {
    Alert.alert(
      "Cancelar reserva",
      "Tem a certeza que deseja cancelar esta reserva?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.patch(`/bookings/${bookingId}/cancel/owner`);
              Alert.alert("Sucesso", "Reserva cancelada.");
              fetchHostBookings();
            } catch (error) {
              const msg = error.response?.data?.message || "Erro ao cancelar.";
              Alert.alert("Erro", msg);
            }
          },
        },
      ],
    );
  };

  const openCheckinModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setManualCode("");
    setCheckinModalVisible(true);
    setCameraVisible(false);
    scanHandled.current = false;
  };

  const closeCheckinModal = () => {
    setCheckinModalVisible(false);
    setCameraVisible(false);
    setSelectedBookingId(null);
    setManualCode("");
    setCheckinLoading(false);
    scanHandled.current = false;
  };

  const performCheckin = async (code) => {
    if (!code || code.trim() === "") {
      Alert.alert("Erro", "Insira ou leia o código da reserva.");
      return;
    }

    if (checkinLoading) return;

    setCheckinLoading(true);
    try {
      await api.patch(`/bookings/${selectedBookingId}/checkin`, {
        code: code.trim(),
      });
      Alert.alert("Sucesso", "Check‑in realizado.");
      closeCheckinModal();
      fetchHostBookings();
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao fazer check‑in.";
      Alert.alert("Erro", msg);
    } finally {
      setCheckinLoading(false);
    }
  };

  const startQRScanner = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert("Permissão", "Conceda acesso à câmara para ler o QR code.");
        return;
      }
    }
    scanHandled.current = false;
    setCameraVisible(true);
  };

  const onBarcodeScanned = ({ data }) => {
    if (scanHandled.current) return;
    scanHandled.current = true;
    setCameraVisible(false);
    performCheckin(data);
  };

  const handleCheckout = (bookingId) => {
    Alert.alert("Check‑out", "Confirma que o hóspede está a sair?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, fazer check‑out",
        onPress: async () => {
          try {
            await api.patch(`/bookings/${bookingId}/checkout`);
            Alert.alert("Sucesso", "Check‑out realizado.");
            fetchHostBookings();
          } catch (error) {
            const msg =
              error.response?.data?.message || "Erro ao fazer check‑out.";
            Alert.alert("Erro", msg);
          }
        },
      },
    ]);
  };

  // Aplicar filtro
  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active")
      return booking.status === "confirmed" || booking.status === "checked_in";
    return booking.status === filterStatus; // completed, cancelled
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.placeTitle} numberOfLines={1}>
          {item.place?.title || "Anúncio"}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColors[item.status] || "#ccc" },
          ]}
        >
          <Text style={styles.badgeText}>
            {statusLabels[item.status] || item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.guestName}>Hóspede: {item.user?.name || "N/A"}</Text>
      <Text style={styles.dates}>
        {item.checkin} → {item.checkout} • {item.nights}{" "}
        {item.nights === 1 ? "noite" : "noites"}
      </Text>
      <Text style={styles.guests}>Participantes: {item.guests}</Text>
      <Text style={styles.total}>Total: €{item.total}</Text>

      <View style={styles.actionsRow}>
        {item.status === "confirmed" && (
          <>
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => openCheckinModal(item._id)}
            >
              <Text style={styles.checkinButtonText}>Check‑in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButtonSmall}
              onPress={() => handleCancel(item._id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "checked_in" && (
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => handleCheckout(item._id)}
          >
            <Text style={styles.checkoutButtonText}>Check‑out</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.header}>Reservas Recebidas</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.filterChip,
              filterStatus === opt.key && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(opt.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === opt.key && styles.filterChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma reserva neste filtro.</Text>
        }
      />

      {/* Modal de check‑in */}
      <Modal
        visible={checkinModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeCheckinModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Check‑in do hóspede</Text>

            {!cameraVisible ? (
              <>
                <Text style={styles.modalOptionLabel}>
                  Escolha como obter o código da reserva:
                </Text>

                <TouchableOpacity
                  style={styles.modalOptionButton}
                  onPress={startQRScanner}
                  disabled={checkinLoading}
                >
                  <Text style={styles.modalOptionButtonText}>Ler QR code</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.modalOptionLabel}>
                  Ou digite o código manualmente:
                </Text>
                <TextInput
                  style={styles.manualInput}
                  value={manualCode}
                  onChangeText={setManualCode}
                  placeholder="Ex: RES-ABC123"
                  autoCapitalize="characters"
                  editable={!checkinLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.modalOptionButton,
                    checkinLoading && { opacity: 0.5 },
                  ]}
                  onPress={() => performCheckin(manualCode)}
                  disabled={checkinLoading}
                >
                  <Text style={styles.modalOptionButtonText}>
                    {checkinLoading ? "Processando..." : "Confirmar código"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelModalButton}
                  onPress={closeCheckinModal}
                  disabled={checkinLoading}
                >
                  <Text style={styles.cancelModalButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CameraView
                  style={styles.camera}
                  onBarcodeScanned={onBarcodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                />
                <TouchableOpacity
                  style={styles.cancelModalButton}
                  onPress={() => setCameraVisible(false)}
                >
                  <Text style={styles.cancelModalButtonText}>
                    Cancelar leitura
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingTop: 60,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textLight,
  },
  // Filtros
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  placeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  guestName: { fontSize: 14, color: "#555", marginBottom: 4 },
  dates: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  guests: { fontSize: 14, color: "#555", marginBottom: 4 },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  checkinButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  checkinButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 16,
    textAlign: "center",
  },
  modalOptionLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  modalOptionButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
  },
  modalOptionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  cancelModalButton: {
    marginTop: 8,
    alignItems: "center",
  },
  cancelModalButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  camera: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
});
