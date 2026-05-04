import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";
import StarRating from "../components/StarRating";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campo único para nome completo
  const [fullName, setFullName] = useState("");

  const [address, setAddress] = useState("");
  const [phoneCode, setPhoneCode] = useState("+351");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Avaliações
  const [reviews, setReviews] = useState({
    avgHost: 0,
    avgGuest: 0,
    totalHost: 0,
    totalGuest: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/profile");
      const p = res.data;
      setProfile(p);
      // Prioriza fullName; se vazio, usa name
      setFullName(p.fullName || p.name || "");
      setAddress(p.address || "");
      setPhoneCode(p.phoneCode || "+351");
      setPhone(p.phone || "");
      setBirthDate(p.birthDate ? p.birthDate.split("T")[0] : "");
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!user?._id) return;
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/user/${user._id}`);
      setReviews(res.data);
    } catch (error) {
      // Silencioso
    } finally {
      setReviewsLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchReviews();
    }, [fetchProfile, fetchReviews]),
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: fullName, // mantém o nome de exibição sincronizado
        fullName, // atualiza também o campo fullName
        address,
        phoneCode,
        phone,
        birthDate: birthDate || null,
      };
      const res = await api.put("/users/profile", payload);
      Alert.alert("Sucesso", "Perfil atualizado.");
      setProfile(res.data);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao guardar.";
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53935" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.subtitle}>
        Gerencie suas informações pessoais e segurança
      </Text>

      {/* Avaliações */}
      <View style={styles.ratingRow}>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLabel}>Anfitrião</Text>
          {reviewsLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <StarRating rating={Math.round(reviews.avgHost)} size={20} />
              <Text style={styles.ratingValue}>
                {reviews.avgHost.toFixed(1)} ({reviews.totalHost} avaliações)
              </Text>
            </>
          )}
        </View>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLabel}>Hóspede</Text>
          {reviewsLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <StarRating rating={Math.round(reviews.avgGuest)} size={20} />
              <Text style={styles.ratingValue}>
                {reviews.avgGuest.toFixed(1)} ({reviews.totalGuest} avaliações)
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Nome completo */}
      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Email (leitura) */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={user?.email}
        editable={false}
        selectTextOnFocus={false}
      />

      {/* Endereço */}
      <Text style={styles.label}>Endereço completo</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      {/* Telefone */}
      <View style={styles.phoneRow}>
        <View style={styles.phoneCodeContainer}>
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.phoneCodeInput}
            value={phoneCode}
            onChangeText={setPhoneCode}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.phoneContainer}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Data de nascimento */}
      <Text style={styles.label}>Data de nascimento</Text>
      <TextInput
        style={styles.input}
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      {/* Guardar */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar alterações</Text>
        )}
      </TouchableOpacity>

      {/* Segurança */}
      <Text style={styles.sectionTitle}>Segurança</Text>
      <TouchableOpacity
        style={styles.linkItem}
        onPress={() => navigation.navigate("ChangeEmail")}
      >
        <Text style={styles.linkText}>Alterar email</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkItem}
        onPress={() => navigation.navigate("ChangePassword")}
      >
        <Text style={styles.linkText}>Alterar palavra-passe</Text>
      </TouchableOpacity>

      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>
          Seu perfil é {user?.role === "user" ? "Utilizador" : user?.role}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Encerrar sessão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fefefe",
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1b1b1b",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  ratingBlock: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  phoneRow: {
    flexDirection: "row",
    gap: 12,
  },
  phoneCodeContainer: {
    flex: 1,
  },
  phoneContainer: {
    flex: 2,
  },
  phoneCodeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b1b1b",
    marginBottom: 16,
  },
  linkItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  linkText: {
    fontSize: 16,
    color: "#4a90e2",
  },
  roleContainer: {
    marginTop: 20,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 14,
    color: "#888",
  },
  logoutButton: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
