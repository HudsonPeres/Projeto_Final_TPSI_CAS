import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const COLORS = {
  primary: "#e53935",
  secondary: "#43a047",
  accent: "#4a90e2",
  backgroundLight: "#fefefe",
  backgroundDark: "#1a1a1a",
  textLight: "#1b1b1b",
  textDark: "#eeeeee",
  border: "#e0e0e0",
  cardBackground: "#ffffff",
};

const DISTANCE_OPTIONS = [
  { label: "25 km", value: 25000 },
  { label: "50 km", value: 50000 },
  { label: "100 km", value: 100000 },
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minGuests, setMinGuests] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [locationText, setLocationText] = useState("");
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [usingLocation, setUsingLocation] = useState(false);

  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  const getCurrentLocation = async () => {
    setUsingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Ative a localização para usar este filtro.",
        );
        setUsingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLat(loc.coords.latitude);
      setUserLng(loc.coords.longitude);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter a localização.");
    } finally {
      setUsingLocation(false);
    }
  };

  const buildQueryParams = () => {
    const params = {};
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minGuests) params.minGuests = minGuests;
    if (maxGuests) params.maxGuests = maxGuests;
    if (locationText.trim()) params.location = locationText.trim();
    if (selectedDistance && userLat && userLng) {
      params.lat = userLat;
      params.lng = userLng;
      params.radius = selectedDistance;
    }
    return params;
  };

  const fetchPlaces = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const params = buildQueryParams();
        const res = await api.get("/places", { params });
        setPlaces(res.data);
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar anúncios.");
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      minPrice,
      maxPrice,
      minGuests,
      maxGuests,
      locationText,
      selectedDistance,
      userLat,
      userLng,
    ],
  );

  // Atualiza a lista quando os filtros mudam
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Atualiza a lista silenciosamente sempre que o ecrã ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchPlaces({ silent: true });
    }, [fetchPlaces]),
  );

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  // Função para pull-to-refresh
  const handleRefresh = () => {
    fetchPlaces({ silent: true });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PlaceDetail", { id: item._id })}
      activeOpacity={0.7}
    >
      {item.photos && item.photos.length > 0 && (
        <Image
          source={{ uri: item.photos[0] }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            €{item.price} / {item.isMultiDay ? "diária" : "atividade"}
          </Text>
          <Text style={styles.cardGuests}>Até {item.guests} pessoas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.greeting}>
          Bem‑vindo(a), {user?.name?.split(" ")[0]}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={places}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum anúncio encontrado.</Text>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Modal dos Filtros (inalterado) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Filtrar anúncios</Text>

                <Text style={styles.filterLabel}>Preço (€)</Text>
                <View style={styles.row}>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Mín"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Máx"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.filterLabel}>Nº de pessoas</Text>
                <View style={styles.row}>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Mín"
                    value={minGuests}
                    onChangeText={setMinGuests}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Máx"
                    value={maxGuests}
                    onChangeText={setMaxGuests}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.filterLabel}>Local (endereço)</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Ex: Lisboa"
                  value={locationText}
                  onChangeText={setLocationText}
                />

                <Text style={styles.filterLabel}>Distância máxima</Text>
                <View style={styles.distanceRow}>
                  {DISTANCE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.distanceChip,
                        selectedDistance === opt.value &&
                          styles.distanceChipActive,
                      ]}
                      onPress={() => {
                        setSelectedDistance(
                          opt.value === selectedDistance ? null : opt.value,
                        );
                        if (!userLat || !userLng) getCurrentLocation();
                      }}
                    >
                      <Text
                        style={[
                          styles.distanceChipText,
                          selectedDistance === opt.value &&
                            styles.distanceChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {usingLocation && (
                  <ActivityIndicator style={{ marginTop: 8 }} />
                )}
                {userLat && (
                  <Text style={styles.locationHint}>
                    Localização atual usada
                  </Text>
                )}
              </ScrollView>
            </TouchableWithoutFeedback>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setMinGuests("");
                  setMaxGuests("");
                  setLocationText("");
                  setSelectedDistance(null);
                }}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={closeModal}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal do Menu Principal (inalterado) */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("ProfileTab");
              }}
            >
              <Text style={styles.menuItemText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("BookingsTab");
              }}
            >
              <Text style={styles.menuItemText}>Reservas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("MyPlacesTab");
              }}
            >
              <Text style={styles.menuItemText}>Meus anúncios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("MessagesTab");
              }}
            >
              <Text style={styles.menuItemText}>Mensagens</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("ProfileTab", { screen: "HostReviews" });
              }}
            >
              <Text style={styles.menuItemText}>Avaliar hóspedes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("ProfileTab", { screen: "Support" });
              }}
            >
              <Text style={styles.menuItemText}>Suporte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => {
                setMenuVisible(false);
                logout();
              }}
            >
              <Text style={[styles.menuItemText, { color: "#e53935" }]}>
                Encerrar sessão
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Estilos mantidos exatamente como no código anterior
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  menuIcon: { fontSize: 24, color: COLORS.textLight },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textLight,
    flex: 1,
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterButtonText: { color: "#fff", fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 180 },
  cardContent: { padding: 12 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 4,
  },
  cardDescription: { fontSize: 14, color: "#666", marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  cardGuests: { fontSize: 13, color: "#888" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.textLight,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: COLORS.textLight,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flex: 1,
  },
  row: { flexDirection: "row", gap: 8 },
  distanceRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  distanceChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },
  distanceChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  distanceChipText: { color: COLORS.textLight },
  distanceChipTextActive: { color: "#fff" },
  locationHint: { fontSize: 12, color: COLORS.secondary, marginTop: 4 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  clearButton: { backgroundColor: "#eee" },
  clearButtonText: { color: "#666", fontWeight: "600" },
  applyButton: { backgroundColor: COLORS.primary },
  applyButtonText: { color: "#fff", fontWeight: "bold" },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  menuContainer: {
    width: 260,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: { fontSize: 16, color: "#1b1b1b" },
  logoutItem: { borderBottomWidth: 0, marginTop: 8 },
});
