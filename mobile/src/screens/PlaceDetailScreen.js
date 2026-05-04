import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Modal,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import MapView, { Marker } from "react-native-maps";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "../components/StarRating";

const { width, height } = Dimensions.get("window");

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

  // Avaliações da experiência
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    avg: 0,
    total: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Avaliações do anfitrião
  const [hostRatings, setHostRatings] = useState({ avgHost: 0, totalHost: 0 });

  // Reserva ativa do utilizador para este lugar
  const [activeBooking, setActiveBooking] = useState(null);
  const [checkingBooking, setCheckingBooking] = useState(false);

  // Seleção de datas
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Chat
  const [chatLoading, setChatLoading] = useState(false);

  // Galeria principal
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const flatListRef = useRef(null);

  // Galeria do ecrã completo
  const [fullGalleryIndex, setFullGalleryIndex] = useState(0);
  const fullFlatListRef = useRef(null);

  const isMultiDay = place?.isMultiDay ?? true;
  const isOwner = place?.owner?._id === user._id;
  const hasActiveBooking = activeBooking !== null;

  // Limpa seleções
  const resetSelection = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setGuests(1);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      resetSelection();
    });
    return unsubscribe;
  }, [navigation]);

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
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  // Buscar avaliações do anfitrião
  const fetchHostRatings = useCallback(async () => {
    if (place?.owner?._id) {
      try {
        const res = await api.get(`/reviews/user/${place.owner._id}`);
        setHostRatings({
          avgHost: res.data.avgHost,
          totalHost: res.data.totalHost,
        });
      } catch (err) {
        console.error("Erro ao carregar avaliações do host:", err);
      }
    }
  }, [place]);

  // Verificar se o hóspede já tem uma reserva ativa para este lugar
  const checkActiveBooking = useCallback(async () => {
    if (!user || !place?._id) return;
    setCheckingBooking(true);
    try {
      const res = await api.get("/bookings/owner");
      const active = res.data.find(
        (b) =>
          b.place?._id === place._id &&
          (b.status === "confirmed" || b.status === "checked_in"),
      );
      setActiveBooking(active || null);
    } catch (err) {
      console.error("Erro ao verificar reserva ativa:", err);
    } finally {
      setCheckingBooking(false);
    }
  }, [user, place?._id]);

  useEffect(() => {
    fetchData();
    fetchReviews();
  }, [fetchData, fetchReviews]);

  useEffect(() => {
    fetchHostRatings();
  }, [fetchHostRatings]);

  useEffect(() => {
    checkActiveBooking();
  }, [checkActiveBooking]);

  const goToNextPhoto = () => {
    if (place?.photos && galleryIndex < place.photos.length - 1) {
      const nextIndex = galleryIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setGalleryIndex(nextIndex);
    }
  };

  const goToPrevPhoto = () => {
    if (galleryIndex > 0) {
      const prevIndex = galleryIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setGalleryIndex(prevIndex);
    }
  };

  const goToNextFullPhoto = () => {
    if (place?.photos && fullGalleryIndex < place.photos.length - 1) {
      const nextIndex = fullGalleryIndex + 1;
      fullFlatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setFullGalleryIndex(nextIndex);
    }
  };

  const goToPrevFullPhoto = () => {
    if (fullGalleryIndex > 0) {
      const prevIndex = fullGalleryIndex - 1;
      fullFlatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
      setFullGalleryIndex(prevIndex);
    }
  };

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

  const isDateAvailable = (dateStr) => {
    if (availability.bookedDates.includes(dateStr)) return false;
    if (
      !availability.availableDates ||
      availability.availableDates.length === 0
    )
      return true;
    return availability.availableDates.includes(dateStr);
  };

  const getMarkedDates = () => {
    const marked = {};

    if (availability.availableDates && availability.availableDates.length > 0) {
      availability.availableDates.forEach((date) => {
        marked[date] = { selected: true, selectedColor: COLORS.secondary };
      });
    }

    availability.bookedDates.forEach((date) => {
      marked[date] = {
        selected: true,
        selectedColor: COLORS.primary,
        disabled: true,
      };
    });

    if (selectedStart) {
      const start = new Date(selectedStart);
      const end = selectedEnd ? new Date(selectedEnd) : start;

      if (isMultiDay) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          if (!availability.bookedDates.includes(dateStr)) {
            marked[dateStr] = {
              color: COLORS.accent,
              textColor: "white",
              startingDay: d.getTime() === start.getTime(),
              endingDay: d.getTime() === end.getTime(),
            };
          }
        }
      } else {
        const dateStr = selectedStart;
        if (!availability.bookedDates.includes(dateStr)) {
          marked[dateStr] = {
            selected: true,
            color: COLORS.accent,
            textColor: "white",
          };
        }
      }
    }

    return marked;
  };

  const handleDayPress = (day) => {
    const dateStr = day.dateString;

    if (availability.bookedDates.includes(dateStr)) {
      return;
    }

    if (isMultiDay) {
      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(dateStr);
        setSelectedEnd(null);
      } else {
        const start = new Date(selectedStart);
        const end = new Date(dateStr);
        if (end < start) {
          setSelectedStart(dateStr);
          setSelectedEnd(null);
        } else {
          let allAvailable = true;
          const current = new Date(start);
          while (current <= end) {
            const curStr = current.toISOString().split("T")[0];
            if (!isDateAvailable(curStr)) {
              allAvailable = false;
              break;
            }
            current.setDate(current.getDate() + 1);
          }
          if (allAvailable) {
            setSelectedEnd(dateStr);
          } else {
            Alert.alert(
              "Datas indisponíveis",
              "O intervalo contém datas reservadas ou não disponíveis.",
            );
          }
        }
      }
    } else {
      if (isDateAvailable(dateStr)) {
        setSelectedStart(dateStr);
        setSelectedEnd(dateStr);
      }
    }
  };

  const calculateNights = () => {
    if (!selectedStart || !selectedEnd) return 0;
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    if (isMultiDay) {
      return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }
    return 1;
  };

  const handleReserve = async () => {
    if (!selectedStart || (!isMultiDay && !selectedEnd)) {
      Alert.alert("Erro", "Selecione a(s) data(s).");
      return;
    }
    if (guests < 1 || guests > place.guests) {
      Alert.alert(
        "Erro",
        `Número de participantes deve ser entre 1 e ${place.guests}.`,
      );
      return;
    }

    const nights = calculateNights();
    const total = place.price * nights;

    setBookingLoading(true);
    try {
      const bookingData = {
        place: place._id,
        user: user._id,
        price: place.price,
        total,
        checkin: selectedStart,
        checkout: selectedEnd || selectedStart,
        guests,
        nights,
      };

      const res = await api.post("/bookings", bookingData);
      // Atualiza a reserva ativa para a nova reserva
      setActiveBooking(res.data);
      Alert.alert(
        "Reserva confirmada!",
        `Código: ${res.data.bookingCode}\nUm email com o comprovativo foi enviado.`,
        [
          {
            text: "OK",
            onPress: () => {
              resetSelection();
              navigation.navigate("HomeTab", { screen: "HomeMain" });
            },
          },
        ],
      );
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao efetuar reserva.";
      Alert.alert("Erro", msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setGalleryVisible(true)}
    >
      <Image
        source={{ uri: item }}
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderFullImage = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.fullImage}
      resizeMode="contain"
    />
  );

  if (loading || checkingBooking) {
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
    <View style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Galeria */}
        {place.photos && place.photos.length > 0 && (
          <View style={styles.galleryWrapper}>
            {galleryIndex > 0 && (
              <TouchableOpacity
                style={styles.arrowLeft}
                onPress={goToPrevPhoto}
              >
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>
            )}
            {galleryIndex < place.photos.length - 1 && (
              <TouchableOpacity
                style={styles.arrowRight}
                onPress={goToNextPhoto}
              >
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            )}

            <FlatList
              ref={flatListRef}
              data={place.photos}
              renderItem={renderGalleryItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width,
                );
                setGalleryIndex(index);
              }}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              initialScrollIndex={0}
            />

            {place.photos.length > 1 && (
              <View style={styles.dotsContainer}>
                {place.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === galleryIndex
                        ? styles.dotActive
                        : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{place.title}</Text>
          <Text style={styles.address}>{place.address}</Text>
          <Text style={styles.price}>
            €{place.price} / {isMultiDay ? "diária" : "atividade"}
          </Text>
          <Text style={styles.description}>{place.description}</Text>

          {place.extras ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Extras</Text>
              <Text style={styles.text}>{place.extras}</Text>
            </View>
          ) : null}

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

          {/* Card do anfitrião */}
          {place.owner && (
            <View style={styles.hostCard}>
              <Text style={styles.hostCardTitle}>Anfitrião</Text>
              <Text style={styles.hostName}>
                {place.owner.name || "Anfitrião"}
              </Text>
              <View style={styles.hostRatingRow}>
                <Text style={styles.hostRatingLabel}>Anfitrião</Text>
                <View style={styles.hostStars}>
                  <StarRating
                    rating={Math.round(hostRatings.avgHost)}
                    readonly
                    size={18}
                  />
                  <Text style={styles.hostRatingCount}>
                    ({hostRatings.totalHost} avaliações)
                  </Text>
                </View>
              </View>
              <View style={styles.hostRatingRow}>
                <Text style={styles.hostRatingLabel}>Experiência</Text>
                <View style={styles.hostStars}>
                  <StarRating
                    rating={Math.round(reviewsData.avg)}
                    readonly
                    size={18}
                  />
                  <Text style={styles.hostRatingCount}>
                    ({reviewsData.total} avaliações)
                  </Text>
                </View>
              </View>
            </View>
          )}

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

          {/* Mapa */}
          {place.location && place.location.coordinates && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Localização</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: place.location.coordinates[1],
                  longitude: place.location.coordinates[0],
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: place.location.coordinates[1],
                    longitude: place.location.coordinates[0],
                  }}
                  title={place.title}
                  description={place.address}
                />
              </MapView>
            </View>
          )}

          {/* Calendário  */}
          {!hasActiveBooking && (
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
                  style={[
                    styles.legendItem,
                    { backgroundColor: COLORS.secondary },
                  ]}
                />
                <Text style={styles.legendText}>Disponível</Text>
                <View
                  style={[
                    styles.legendItem,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
                <Text style={styles.legendText}>Reservado</Text>
                <View
                  style={[
                    styles.legendItem,
                    { backgroundColor: COLORS.accent },
                  ]}
                />
                <Text style={styles.legendText}>Selecionado</Text>
              </View>
            </View>
          )}

          {/* Mensagem de reserva ativa ou formulário de reserva */}
          {hasActiveBooking ? (
            <View style={styles.activeBookingCard}>
              <Text style={styles.activeBookingTitle}>
                Você já tem uma reserva para esta experiência:
              </Text>
              <View style={styles.activeBookingDetails}>
                <Text style={styles.detailText}>
                  Código: {activeBooking.bookingCode}
                </Text>
                <Text style={styles.detailText}>
                  Check‑in: {activeBooking.checkin}
                  {place?.checkin ? ` às ${place.checkin}` : ""}
                </Text>
                <Text style={styles.detailText}>
                  Check‑out: {activeBooking.checkout}
                  {place?.checkout ? ` às ${place.checkout}` : ""}
                </Text>
                <Text style={styles.detailText}>
                  Noites: {activeBooking.nights}
                </Text>
                <Text style={styles.detailText}>
                  Participantes: {activeBooking.guests}
                </Text>
                <Text style={styles.detailText}>
                  Total: €{activeBooking.total}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {activeBooking.status === "confirmed"
                      ? "Confirmada"
                      : "Check‑in realizado"}
                  </Text>
                </View>
              </View>
            </View>
          ) : isOwner ? (
            <View style={styles.ownerMessage}>
              <Text style={styles.ownerMessageText}>
                Você é o anfitrião deste anúncio e não pode reservar a sua
                própria experiência.
              </Text>
            </View>
          ) : (
            <>
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
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal do carrossel */}
      <Modal
        visible={galleryVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setGalleryVisible(false)}
      >
        <TouchableOpacity
          style={styles.galleryOverlay}
          activeOpacity={1}
          onPress={() => setGalleryVisible(false)}
        >
          <TouchableOpacity
            style={styles.galleryCloseButton}
            onPress={() => setGalleryVisible(false)}
          >
            <Text style={styles.galleryCloseText}>✕</Text>
          </TouchableOpacity>

          {place?.photos && place.photos.length > 1 && (
            <>
              {fullGalleryIndex > 0 && (
                <TouchableOpacity
                  style={styles.fullArrowLeft}
                  onPress={goToPrevFullPhoto}
                >
                  <Text style={styles.fullArrowText}>‹</Text>
                </TouchableOpacity>
              )}
              {fullGalleryIndex < place.photos.length - 1 && (
                <TouchableOpacity
                  style={styles.fullArrowRight}
                  onPress={goToNextFullPhoto}
                >
                  <Text style={styles.fullArrowText}>›</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <FlatList
            ref={fullFlatListRef}
            data={place?.photos || []}
            renderItem={renderFullImage}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setFullGalleryIndex(index);
            }}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            initialScrollIndex={0}
          />

          {place?.photos && place.photos.length > 1 && (
            <View style={styles.fullDotsContainer}>
              {place.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === fullGalleryIndex
                      ? styles.dotActive
                      : styles.fullDotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 20,
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
  galleryWrapper: {
    height: 240,
    position: "relative",
  },
  galleryImage: {
    width: width,
    height: 240,
  },
  arrowLeft: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowRight: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 28,
    color: "#e53935",
    fontWeight: "bold",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    backgroundColor: "rgba(0,0,0,0.3)",
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
  contactButton: {
    backgroundColor: COLORS.primary,
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
  hostCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostCardTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  hostName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 12,
  },
  hostRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hostRatingLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  hostStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostRatingCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
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
  ownerMessage: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  ownerMessageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  // Card de reserva ativa
  activeBookingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeBookingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 12,
  },
  activeBookingDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  galleryOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
    padding: 8,
  },
  galleryCloseText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  fullImage: {
    width: width,
    height: height * 0.7,
    resizeMode: "contain",
  },
  fullArrowLeft: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fullArrowRight: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fullArrowText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  fullDotsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  fullDotInactive: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
