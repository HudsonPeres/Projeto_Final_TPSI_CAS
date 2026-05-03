import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "../components/StarRating";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#e53935",
  secondary: "#43a047",
  accent: "#4a90e2",
  backgroundLight: "#fefefe",
  textLight: "#1b1b1b",
  border: "#e0e0e0",
  cardBackground: "#ffffff",
  disabled: "#ccc",
};

export default function PlaceDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();

  const [place, setPlace] = useState(null);
  const [availability, setAvailability] = useState({
    availableDates: [],
    bookedDates: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Avaliações
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    avg: 0,
    total: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Seleção de datas
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Chat
  const [chatLoading, setChatLoading] = useState(false);

  const isMultiDay = place?.isMultiDay ?? true;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [placeRes, availRes] = await Promise.all([
        api.get(`/places/${id}`),
        api.get(`/places/${id}/availability`),
      ]);
      setPlace(placeRes.data);
      setAvailability(availRes.data);
    } catch (err) {
      setError("Erro ao carregar detalhes do anúncio.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/place/${id}`);
      setReviewsData(res.data);
    } catch (err) {
      // Silencioso
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    fetchReviews();
  }, [fetchData, fetchReviews]);

  // Iniciar conversa com o anfitrião
  const handleContactHost = async () => {
    if (!place?.owner?._id) {
      Alert.alert("Erro", "Não foi possível identificar o anfitrião.");
      return;
    }
    setChatLoading(true);
    try {
      const res = await api.post("/chat/conversations/start", {
        otherUserId: place.owner._id,
        placeId: place._id,
      });
      const conversation = res.data;
      navigation.navigate("Conversation", {
        conversationId: conversation._id,
        otherUserName: place.owner.name || "Anfitrião",
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao iniciar conversa.";
      Alert.alert("Erro", msg);
    } finally {
      setChatLoading(false);
    }
  };

  // (resto das funções mantêm-se iguais)
  const getMarkedDates = () => {
    /* ... igual ... */
  };
  const handleDayPress = (day) => {
    /* ... igual ... */
  };
  const calculateNights = () => {
    /* ... igual ... */
  };
  const handleReserve = async () => {
    /* ... igual ... */
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !place) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error || "Anúncio não encontrado."}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nights = calculateNights();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Galeria de fotos */}
      {place.photos && place.photos.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
        >
          {place.photos.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.galleryImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{place.title}</Text>
        <Text style={styles.address}>{place.address}</Text>
        <Text style={styles.price}>
          €{place.price} / {isMultiDay ? "noite" : "dia"}
        </Text>
        <Text style={styles.description}>{place.description}</Text>

        {/* Extras */}
        {place.extras ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extras</Text>
            <Text style={styles.text}>{place.extras}</Text>
          </View>
        ) : null}

        {/* Perks */}
        {place.perks && place.perks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comodidades</Text>
            {place.perks.map((perk, i) => (
              <Text key={i} style={styles.perk}>
                • {perk}
              </Text>
            ))}
          </View>
        )}

        {/*DÚVIDAS? ME CONTACTE */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactHost}
          disabled={chatLoading}
        >
          {chatLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.contactButtonText}>Dúvidas? Me contacte</Text>
          )}
        </TouchableOpacity>

        {/* Avaliações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          {reviewsLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : reviewsData.reviews.length > 0 ? (
            <>
              <View style={styles.avgRatingRow}>
                <StarRating rating={Math.round(reviewsData.avg)} size={20} />
                <Text style={styles.avgText}>
                  {reviewsData.avg.toFixed(1)} ({reviewsData.total}{" "}
                  {reviewsData.total === 1 ? "avaliação" : "avaliações"})
                </Text>
              </View>
              {reviewsData.reviews.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {review.reviewer?.name || "Anónimo"}
                    </Text>
                    <StarRating rating={review.ratingExperience} size={16} />
                  </View>
                  {review.comment ? (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  ) : null}
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.noReviews}>Nenhuma avaliação ainda.</Text>
          )}
        </View>

        {/* Calendário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <Calendar
            markingType={isMultiDay ? "period" : "simple"}
            markedDates={getMarkedDates()}
            onDayPress={handleDayPress}
            minDate={new Date().toISOString().split("T")[0]}
            theme={{
              todayTextColor: COLORS.accent,
              selectedDayBackgroundColor: COLORS.accent,
              arrowColor: COLORS.primary,
            }}
          />
          <View style={styles.legend}>
            <View
              style={[styles.legendItem, { backgroundColor: COLORS.secondary }]}
            />
            <Text style={styles.legendText}>Disponível</Text>
            <View
              style={[styles.legendItem, { backgroundColor: COLORS.primary }]}
            />
            <Text style={styles.legendText}>Reservado</Text>
            <View
              style={[styles.legendItem, { backgroundColor: COLORS.accent }]}
            />
            <Text style={styles.legendText}>Selecionado</Text>
          </View>
        </View>

        {/* Seleção de datas e reserva (inalterado) */}
        {selectedStart && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datas escolhidas</Text>
            <Text style={styles.text}>
              Check‑in: {selectedStart}
              {isMultiDay
                ? `\nCheck‑out: ${selectedEnd || "não definida"}`
                : ""}
            </Text>
            {isMultiDay && selectedEnd && (
              <Text style={styles.text}>Noites: {nights}</Text>
            )}
            {isMultiDay && selectedStart && !selectedEnd && (
              <Text style={styles.hint}>Toque na data de saída</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participantes (máx {place.guests})
          </Text>
          <TextInput
            style={styles.input}
            value={String(guests)}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num) && num >= 1 && num <= place.guests)
                setGuests(num);
              else if (text === "") setGuests("");
            }}
            keyboardType="numeric"
            placeholder="Número de pessoas"
          />
        </View>

        {selectedStart && selectedEnd && nights > 0 && (
          <View style={styles.section}>
            <Text style={styles.total}>
              Total estimado: €{place.price * nights}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.reserveButton,
            (bookingLoading ||
              !selectedStart ||
              (isMultiDay && !selectedEnd) ||
              !place) &&
              styles.disabledButton,
          ]}
          onPress={handleReserve}
          disabled={
            bookingLoading ||
            !selectedStart ||
            (isMultiDay && !selectedEnd) ||
            !place
          }
        >
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.reserveButtonText}>Reservar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  link: {
    color: COLORS.accent,
    fontSize: 16,
  },
  gallery: {
    height: 240,
  },
  galleryImage: {
    width: width,
    height: 240,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  perk: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
    marginBottom: 4,
  },
  // Botão de contacto
  contactButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Avaliações
  avgRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avgText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    lineHeight: 20,
  },
  noReviews: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  legendItem: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginRight: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: COLORS.accent,
    marginTop: 4,
  },
  reserveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
