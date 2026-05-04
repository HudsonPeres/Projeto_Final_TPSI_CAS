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
    fetchBookings();
  };

  // ✅ NOVO – Cancelamento da reserva
  const handleCancel = (booking) => {
    const checkin = new Date(booking.checkin);
    const now = new Date();
    const hoursDiff = (checkin - now) / (1000 * 60 * 60);

    if (hoursDiff < 48) {
      Alert.alert(
        "Cancelamento não permitido",
        "Não é possível cancelar com menos de 48h de antecedência. Deseja contactar o suporte?",
        [
          { text: "Fechar", style: "cancel" },
          {
            text: "Ir para Suporte",
            onPress: () =>
              navigation.navigate("ProfileTab", { screen: "Support" }),
          },
        ],
      );
      return;
    }

    Alert.alert(
      "Confirmar cancelamento",
      "Tem a certeza que deseja cancelar esta reserva?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.patch(`/bookings/${booking._id}/cancel/self`);
              Alert.alert("Sucesso", "Reserva cancelada com sucesso.");
              fetchBookings();
            } catch (error) {
              const data = error.response?.data;
              const msg = data?.message || "Erro ao cancelar reserva.";
              Alert.alert("Erro", msg);
              if (data?.contactSupport) {
                Alert.alert("Contactar Suporte", "Deseja ir para o suporte?", [
                  { text: "Fechar", style: "cancel" },
                  {
                    text: "Suporte",
                    onPress: () =>
                      navigation.navigate("ProfileTab", {
                        screen: "Support",
                      }),
                  },
                ]);
              }
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
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
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleResend(item._id)}
              >
                <Text style={styles.actionText}>Reenviar comprovativo</Text>
              </TouchableOpacity>
              {/* ✅ Botão Cancelar reserva */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCancel(item)}
              >
                <Text style={[styles.actionText, { color: COLORS.primary }]}>
                  Cancelar reserva
                </Text>
              </TouchableOpacity>
            </>
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
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.header}>As Minhas Reservas</Text>
      </View>

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
