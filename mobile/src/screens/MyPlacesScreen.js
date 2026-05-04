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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardAddress}>{item.address}</Text>
      <Text style={styles.cardPrice}>
        €{item.price} / {item.isMultiDay ? "diária" : "atividade"}
      </Text>
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
  editButton: { alignSelf: "flex-start" },
  editText: { color: "#4a90e2", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
