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

  // Seleção de datas
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const isMultiDay = place?.isMultiDay ?? true;

  // Buscar detalhes e disponibilidade
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Preparar datas marcadas para o calendário
  const getMarkedDates = () => {
    const marked = {};

    // Datas disponíveis (verdes)
    availability.availableDates.forEach((date) => {
      marked[date] = { color: COLORS.secondary, textColor: "white" };
    });

    // Datas reservadas (vermelhas)
    availability.bookedDates.forEach((date) => {
      marked[date] = {
        color: COLORS.primary,
        textColor: "white",
        disabled: true,
      };
    });

    // Datas selecionadas (intervalo)
    if (selectedStart) {
      const start = new Date(selectedStart);
      const end = selectedEnd ? new Date(selectedEnd) : start;

      if (isMultiDay) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          // Sobrepõe apenas se a data não estiver reservada
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
        // Apenas um dia
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

    // Não permite selecionar datas reservadas
    if (availability.bookedDates.includes(dateStr)) {
      return;
    }

    if (isMultiDay) {
      // Lógica de intervalo
      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(dateStr);
        setSelectedEnd(null);
      } else {
        // selectedStart existe e selectedEnd é null
        const start = new Date(selectedStart);
        const end = new Date(dateStr);
        if (end < start) {
          setSelectedStart(dateStr);
          setSelectedEnd(null);
        } else {
          // Verifica se todas as datas no intervalo estão disponíveis
          let allAvailable = true;
          const current = new Date(start);
          while (current <= end) {
            const curStr = current.toISOString().split("T")[0];
            if (
              !availability.availableDates.includes(curStr) ||
              availability.bookedDates.includes(curStr)
            ) {
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
      // Single day
      setSelectedStart(dateStr);
      setSelectedEnd(dateStr);
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
      Alert.alert(
        "Reserva confirmada!",
        `Código: ${res.data.bookingCode}\nUm email com o comprovativo foi enviado.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
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

        {/* Preço */}
        <Text style={styles.price}>
          €{place.price} / {isMultiDay ? "noite" : "dia"}
        </Text>

        {/* Descrição */}
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

        {/* Selecionar datas (informação) */}
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

        {/* Número de participantes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participantes (máx {place.guests})
          </Text>
          <TextInput
            style={styles.input}
            value={String(guests)}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num) && num >= 1 && num <= place.guests) {
                setGuests(num);
              } else if (text === "") {
                setGuests("");
              }
            }}
            keyboardType="numeric"
            placeholder="Número de pessoas"
          />
        </View>

        {/* Total estimado */}
        {selectedStart && selectedEnd && nights > 0 && (
          <View style={styles.section}>
            <Text style={styles.total}>
              Total estimado: €{place.price * nights}
            </Text>
          </View>
        )}

        {/* Botão de reserva */}
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
  calendarContainer: {
    marginTop: 10,
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
