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

export default function HostReviewsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Obter todas as reservas dos anúncios do anfitrião
      const res = await api.get("/bookings/host");
      const all = res.data;

      // Filtrar apenas concluídas e verificar se já avaliou
      const withReviewStatus = await Promise.all(
        all.map(async (booking) => {
          if (booking.status !== "completed") return null;
          // Verificar se já existe review de tipo "guest" para esta reserva
          try {
            const reviewRes = await api.get(
              `/reviews/user/${booking.user._id}`,
            );
            // Procurar review com este bookingId e type "guest"
            const alreadyReviewed = reviewRes.data.reviews.some(
              (r) => r.booking === booking._id && r.type === "guest",
            );
            if (!alreadyReviewed) {
              return { ...booking, guestReviewed: false };
            }
          } catch (err) {
            // Se der erro, mostrar na mesma (não avaliado)
            return { ...booking, guestReviewed: false };
          }
          return null;
        }),
      );

      setBookings(withReviewStatus.filter(Boolean));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleReview = (booking) => {
    setSelectedBooking(booking);
    setReviewModalVisible(true);
  };

  const handleReviewSuccess = () => {
    setReviewModalVisible(false);
    setSelectedBooking(null);
    fetchData();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.placeTitle}>
        {item.place?.title || "Experiência"}
      </Text>
      <Text style={styles.guestName}>Hóspede: {item.user?.name || "Nome"}</Text>
      <Text style={styles.code}>Código: {item.bookingCode}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleReview(item)}
      >
        <Text style={styles.actionText}>Avaliar hóspede</Text>
      </TouchableOpacity>
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
      <Text style={styles.header}>Avaliações Pendentes</Text>
      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Não há hóspedes por avaliar.</Text>
        }
      />
      <ReviewModal
        visible={reviewModalVisible}
        booking={selectedBooking}
        mode="host"
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
  placeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 4,
  },
  guestName: { fontSize: 16, color: COLORS.textLight, marginBottom: 4 },
  code: { fontSize: 14, color: "#555", marginBottom: 8 },
  actionButton: { alignSelf: "flex-start" },
  actionText: { color: COLORS.accent, fontWeight: "600", fontSize: 14 },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
