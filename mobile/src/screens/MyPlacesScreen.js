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

export default function MyPlacesScreen({ navigation }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/places/owner");
      setPlaces(res.data);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar os seus anúncios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyPlaces();
    }, [fetchMyPlaces]),
  );

  const handleDelete = (placeId, title) => {
    Alert.alert(
      "Apagar anúncio",
      `Tem a certeza que deseja apagar "${title}"? Esta ação é irreversível.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/places/${placeId}`, {
                data: { reason: "Removido pelo proprietário" },
              });
              Alert.alert("Sucesso", "Anúncio apagado.");
              fetchMyPlaces();
            } catch (error) {
              const msg =
                error.response?.data?.message || "Erro ao apagar anúncio.";
              Alert.alert("Erro", msg);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardAddress}>{item.address}</Text>
      <Text style={styles.cardPrice}>
        €{item.price} / {item.isMultiDay ? "diária" : "atividade"}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("HomeTab", {
              screen: "PlaceForm",
              params: { placeId: item._id },
            })
          }
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id, item.title)}
        >
          <Text style={styles.deleteText}>Apagar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Meus Anúncios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("HomeTab", {
              screen: "PlaceForm",
              params: { placeId: null },
            })
          }
        >
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Novo botão para as reservas recebidas */}
      <TouchableOpacity
        style={styles.hostBookingsButton}
        onPress={() =>
          navigation.navigate("ProfileTab", { screen: "HostBookings" })
        }
      >
        <Text style={styles.hostBookingsButtonText}>Reservas Recebidas</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#e53935"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={places}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Ainda não tem anúncios.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1b1b1b" },
  addButton: {
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  hostBookingsButton: {
    backgroundColor: "#e53935",
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
  },
  hostBookingsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardAddress: { color: "#666", marginBottom: 4 },
  cardPrice: { color: "#e53935", fontWeight: "bold", marginBottom: 8 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  editButton: { alignSelf: "flex-start" },
  editText: { color: "#4a90e2", fontWeight: "600" },
  deleteButton: { alignSelf: "flex-start" },
  deleteText: { color: "#e53935", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
