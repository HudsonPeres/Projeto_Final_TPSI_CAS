import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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

export default function HostBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

      {item.status === "confirmed" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item._id)}
        >
          <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
        </TouchableOpacity>
      )}
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

      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Ainda não recebeu reservas.</Text>
        }
      />
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
  guests: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  cancelButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
