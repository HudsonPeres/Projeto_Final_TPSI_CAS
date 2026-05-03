import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

export default function MyPlacesScreen({ navigation }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/places/owner");
      setPlaces(res.data);
    } catch (error) {
      console.error(error);
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
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardAddress}>{item.address}</Text>
      <Text style={styles.cardPrice}>€{item.price}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#e53935" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meus Anúncios</Text>
      <FlatList
        data={places}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>Ainda não tem anúncios.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fefefe",
  },
  loader: { flex: 1, justifyContent: "center" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1b1b1b",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1b1b1b" },
  cardAddress: { color: "#666", marginBottom: 4 },
  cardPrice: { color: "#e53935", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
