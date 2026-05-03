import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Botão de voltar */}
      <View style={styles.header}>
        <BackButton />
      </View>

      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.subtitle}>
        Gerencie suas informações pessoais e segurança
      </Text>

      {/* Avaliações (placeholder) */}
      <View style={styles.ratingRow}>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLabel}>Anfitrião</Text>
          <Text style={styles.ratingValue}>(0 avaliações)</Text>
        </View>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLabel}>Hóspede</Text>
          <Text style={styles.ratingValue}>(0 avaliações)</Text>
        </View>
      </View>

      {/* Dados pessoais (placeholders) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nome completo</Text>
        <Text style={styles.fieldValue}>{user?.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <Text style={styles.fieldValue}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endereço completo</Text>
        <Text style={styles.fieldValue}>[ ]</Text>
      </View>

      <View style={styles.horizontalRow}>
        <View style={styles.halfSection}>
          <Text style={styles.sectionTitle}>Código</Text>
          <Text style={styles.fieldValue}>+351</Text>
        </View>
        <View style={styles.halfSection}>
          <Text style={styles.sectionTitle}>Data de nascimento</Text>
          <Text style={styles.fieldValue}>dd/mm/aaaa</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Guardar alterações</Text>
      </TouchableOpacity>

      {/* Segurança */}
      <Text style={styles.securityTitle}>Segurança</Text>

      <TouchableOpacity
        style={styles.securityItem}
        onPress={() => navigation.navigate("ChangeEmail")}
      >
        <Text style={styles.securityItemText}>Alterar email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.securityItem}
        onPress={() => navigation.navigate("ChangePassword")}
      >
        <Text style={styles.securityItemText}>Alterar palavra-passe</Text>
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
  container: { flex: 1, backgroundColor: "#fefefe", paddingHorizontal: 20 },
  header: { marginTop: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1b1b1b" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  ratingBlock: { flex: 1, alignItems: "center" },
  ratingLabel: { fontSize: 16, fontWeight: "600" },
  ratingValue: { fontSize: 14, color: "#888" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, color: "#666", marginBottom: 4 },
  fieldValue: {
    fontSize: 18,
    color: "#1b1b1b",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  horizontalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  halfSection: { flex: 1, marginRight: 8 },
  saveButton: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  securityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b1b1b",
    marginBottom: 16,
  },
  securityItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  securityItemText: { fontSize: 16, color: "#4a90e2" },
  roleContainer: { marginTop: 20, marginBottom: 12 },
  roleText: { fontSize: 14, color: "#888" },
  logoutButton: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
