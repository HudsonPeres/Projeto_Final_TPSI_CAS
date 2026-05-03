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
import { useAuth } from "../contexts/AuthContext";
import ReviewModal from "../components/ReviewModal";

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
  checked_in: "Check‑in realizado",
  completed: "Concluída",
};

const statusColors = {
  confirmed: COLORS.secondary,
  cancelled: COLORS.primary,
  checked_in: COLORS.accent,
  completed: "#888",
};

export default function BookingsScreen({ navigation }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/owner");
      setBookings(res.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  const handleResend = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/resend-voucher`);
      Alert.alert("Sucesso", "Comprovativo reenviado para o seu email.");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Erro ao reenviar comprovativo.";
      Alert.alert("Erro", msg);
    }
  };

  const handleReview = (booking) => {
    setSelectedBooking(booking);
    setReviewModalVisible(true);
  };

  const handleReviewSuccess = () => {
    setReviewModalVisible(false);
    setSelectedBooking(null);
    fetchBookings(); // atualiza a lista (hasReviewed será true)
  };

  const renderItem = ({ item }) => {
    // Determina se o utilizador logado é o hóspede ou o anfitrião
    const isGuest = item.user === user._id; // simplificado: comparar _id
    // (Como o endpoint /bookings/owner retorna as reservas do utilizador,
    // todas as reservas aqui são do hóspede, pois é GET /bookings/owner que listamos.
    // Logo, o user logado é o hóspede. Então podemos usar isso.)
    const canReview = item.status === "completed" && !item.hasReviewed;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.placeTitle}>
            {item.place?.title || "Experiência"}
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
        <Text style={styles.code}>Código: {item.bookingCode}</Text>
        <Text style={styles.dates}>
          {item.checkin} → {item.checkout} • {item.nights}{" "}
          {item.nights === 1 ? "noite" : "noites"}
        </Text>
        <Text style={styles.guests}>Participantes: {item.guests}</Text>
        <Text style={styles.total}>Total: €{item.total}</Text>

        <View style={styles.actions}>
          {item.status === "confirmed" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleResend(item._id)}
            >
              <Text style={styles.actionText}>Reenviar comprovativo</Text>
            </TouchableOpacity>
          )}
          {canReview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReview(item)}
            >
              <Text style={[styles.actionText, { color: COLORS.accent }]}>
                Avaliar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>As Minhas Reservas</Text>
      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Ainda não tem reservas.</Text>
        }
      />
      <ReviewModal
        visible={reviewModalVisible}
        booking={selectedBooking}
        onClose={() => setReviewModalVisible(false)}
        onSuccess={handleReviewSuccess}
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 16,
    color: COLORS.textLight,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  code: { fontSize: 14, color: "#555", marginBottom: 4 },
  dates: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  guests: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 6,
  },
  actionText: {
    color: COLORS.accent,
    fontWeight: "600",
    fontSize: 14,
  },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
