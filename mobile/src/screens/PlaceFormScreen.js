import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import MapView, { Marker } from "react-native-maps"; // ✅ novo
import api from "../services/api";
import BackButton from "../components/BackButton";

const { width } = Dimensions.get("window");

export default function PlaceFormScreen({ route, navigation }) {
  const placeId = route.params?.placeId;
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [extras, setExtras] = useState("");
  const [perks, setPerks] = useState("");
  const [price, setPrice] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(true);
  const [selectedDates, setSelectedDates] = useState({});
  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!placeId);

  // ✅ Estado da localização
  const [location, setLocation] = useState(null); // { lat, lng } ou null
  const mapRef = useRef(null);

  // Buscar dados do anúncio se for edição
  useEffect(() => {
    if (placeId) {
      (async () => {
        try {
          const res = await api.get(`/places/${placeId}`);
          const p = res.data;
          setTitle(p.title);
          setAddress(p.address);
          setDescription(p.description);
          setExtras(p.extras || "");
          setPerks((p.perks || []).join(", "));
          setPrice(String(p.price));
          setCheckin(p.checkin || "");
          setCheckout(p.checkout || "");
          setGuests(String(p.guests));
          setIsMultiDay(p.isMultiDay);
          setPhotos(p.photos || []);

          // ✅ Carregar coordenadas existentes
          if (p.location && p.location.coordinates) {
            const [lng, lat] = p.location.coordinates;
            setLocation({ lat, lng });
          }

          // Marcar datas
          if (p.availableDates) {
            const marked = {};
            p.availableDates.forEach((d) => {
              const dateStr =
                d instanceof Date
                  ? d.toISOString().split("T")[0]
                  : d.split("T")[0];
              marked[dateStr] = { selected: true, selectedColor: "#4a90e2" };
            });
            setSelectedDates(marked);
          }
        } catch (err) {
          Alert.alert("Erro", "Falha ao carregar anúncio.");
        } finally {
          setFetching(false);
        }
      })();
    }
  }, [placeId]);

  // ✅ Centrar o mapa quando a localização é carregada ou mudada
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    }
  }, [location]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewPhotos([...newPhotos, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permissão", "Precisa de conceder acesso à câmara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setNewPhotos([...newPhotos, result.assets[0]]);
    }
  };

  const removeNewPhoto = (index) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const uploadNewPhotos = async () => {
    if (newPhotos.length === 0) return [];
    const formData = new FormData();
    newPhotos.forEach((asset) => {
      formData.append("files", {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || "photo.jpg",
      });
    });
    const res = await api.post("/places/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const handleSave = async () => {
    if (!title || !address || !description || !price || !guests) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls = await uploadNewPhotos();
      const allPhotos = [...photos, ...uploadedUrls];

      const availableDates = Object.keys(selectedDates).filter(
        (d) => selectedDates[d]?.selected,
      );

      // ✅ Incluir localização se definida
      const locationField = location
        ? { type: "Point", coordinates: [location.lng, location.lat] }
        : null;

      const payload = {
        title,
        address,
        photos: allPhotos,
        description,
        extras,
        perks: perks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        price: Number(price),
        checkin,
        checkout,
        guests: Number(guests),
        isMultiDay,
        availableDates,
        location: locationField, // ✅
      };

      if (placeId) {
        await api.put(`/places/${placeId}`, payload);
        Alert.alert("Sucesso", "Anúncio atualizado.");
      } else {
        await api.post("/places", payload);
        Alert.alert("Sucesso", "Anúncio criado.");
      }
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao guardar.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler para toque no mapa (muda localização)
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setLocation({ lat: coordinate.latitude, lng: coordinate.longitude });
  };

  // ✅ Handler para arraste do marcador
  const handleMarkerDragEnd = (event) => {
    const { coordinate } = event.nativeEvent;
    setLocation({ lat: coordinate.latitude, lng: coordinate.longitude });
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53935" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>
          {placeId ? "Editar anúncio" : "Novo anúncio"}
        </Text>
      </View>

      <Text style={styles.label}>Título *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Endereço *</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      {/* ✅ Mapa interativo */}
      <Text style={styles.label}>Localização (toque no mapa para marcar)</Text>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location ? location.lat : 39.5, // centro de Portugal como fallback
            longitude: location ? location.lng : -8.0,
            latitudeDelta: location ? 0.005 : 5,
            longitudeDelta: location ? 0.005 : 5,
          }}
          onPress={handleMapPress}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {location && (
            <Marker
              coordinate={{ latitude: location.lat, longitude: location.lng }}
              draggable
              onDragEnd={handleMarkerDragEnd}
              title="Local da experiência"
            />
          )}
        </MapView>
      </View>
      {location && (
        <Text style={styles.coordsText}>
          Coordenadas: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </Text>
      )}

      <Text style={styles.label}>Descrição *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Extras (ex: alimentação, transporte)</Text>
      <TextInput style={styles.input} value={extras} onChangeText={setExtras} />

      <Text style={styles.label}>Comodidades (separadas por vírgula)</Text>
      <TextInput
        style={styles.input}
        value={perks}
        onChangeText={setPerks}
        placeholder="ex: wifi, parking"
      />

      <Text style={styles.label}>Preço (€) *</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Check‑in (hora)</Text>
      <TextInput
        style={styles.input}
        value={checkin}
        onChangeText={setCheckin}
        placeholder="14:00"
      />

      <Text style={styles.label}>Check‑out (hora)</Text>
      <TextInput
        style={styles.input}
        value={checkout}
        onChangeText={setCheckout}
        placeholder="11:00"
      />

      <Text style={styles.label}>Nº máximo de participantes *</Text>
      <TextInput
        style={styles.input}
        value={guests}
        onChangeText={setGuests}
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Permite vários dias</Text>
        <Switch value={isMultiDay} onValueChange={setIsMultiDay} />
      </View>

      <Text style={styles.label}>Datas disponíveis (toque no dia)</Text>
      <Calendar
        markingType="multi-dot"
        markedDates={selectedDates}
        onDayPress={(day) => {
          const updated = { ...selectedDates };
          if (updated[day.dateString]?.selected) {
            delete updated[day.dateString];
          } else {
            updated[day.dateString] = {
              selected: true,
              selectedColor: "#4a90e2",
            };
          }
          setSelectedDates(updated);
        }}
        minDate={new Date().toISOString().split("T")[0]}
        theme={{
          selectedDayBackgroundColor: "#4a90e2",
          todayTextColor: "#4a90e2",
        }}
      />

      {/* Fotos existentes */}
      {photos.length > 0 && (
        <View style={styles.photoSection}>
          <Text style={styles.label}>Fotos atuais</Text>
          <ScrollView horizontal>
            {photos.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.photoThumb} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Novas fotos */}
      {newPhotos.length > 0 && (
        <View style={styles.photoSection}>
          <Text style={styles.label}>Novas fotos</Text>
          <ScrollView horizontal>
            {newPhotos.map((asset, idx) => (
              <View key={idx} style={styles.newPhotoContainer}>
                <Image source={{ uri: asset.uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => removeNewPhoto(idx)}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={pickImages}>
          <Text style={styles.secondaryButtonText}>Galeria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
          <Text style={styles.secondaryButtonText}>Câmara</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar anúncio</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fefefe", paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 40,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1b1b1b", marginLeft: 8 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
    color: "#1b1b1b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  // ✅ Estilos do mapa
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  map: {
    flex: 1,
  },
  coordsText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  photoSection: { marginTop: 16 },
  photoThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  newPhotoContainer: { position: "relative" },
  removePhotoBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e53935",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removePhotoText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  photoButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e53935",
    alignItems: "center",
  },
  secondaryButtonText: { color: "#e53935", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#e53935",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
