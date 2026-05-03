import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import StarRating from "./StarRating";
import api from "../services/api";

const COLORS = {
  primary: "#e53935",
  accent: "#4a90e2",
  backgroundLight: "#fefefe",
  textLight: "#1b1b1b",
};

export default function ReviewModal({
  visible,
  booking,
  mode = "guest",
  onClose,
  onSuccess,
}) {
  const [ratingHost, setRatingHost] = useState(0);
  const [ratingExperience, setRatingExperience] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const isGuestReview = mode === "guest"; // true quando é o hóspede a avaliar o anfitrião + experiência

  const handleSubmit = async () => {
    if (isGuestReview) {
      if (ratingHost === 0) {
        Alert.alert("Atenção", "Avalie o anfitrião com estrelas.");
        return;
      }
    } else {
      if (ratingHost === 0) {
        Alert.alert("Atenção", "Avalie o hóspede com estrelas.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isGuestReview) {
        // Hóspede: avaliar anfitrião
        await api.post("/reviews", {
          bookingId: booking._id,
          type: "host",
          ratingHost,
          comment,
        });
        if (ratingExperience > 0) {
          await api.post("/reviews", {
            bookingId: booking._id,
            type: "experience",
            ratingExperience,
            comment,
          });
        }
      } else {
        // Anfitrião: avaliar hóspede
        await api.post("/reviews", {
          bookingId: booking._id,
          type: "guest",
          ratingHost, // ratingHost usado como nota para o hóspede
          comment,
        });
      }
      Alert.alert("Obrigado", "Avaliação enviada com sucesso!");
      onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao enviar avaliação.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              {isGuestReview ? "Avaliar experiência" : "Avaliar hóspede"}
            </Text>

            {isGuestReview ? (
              <>
                <Text style={styles.label}>Anfitrião</Text>
                <StarRating
                  rating={ratingHost}
                  onRatingChange={setRatingHost}
                />
                <Text style={styles.label}>Experiência</Text>
                <StarRating
                  rating={ratingExperience}
                  onRatingChange={setRatingExperience}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Nota para o hóspede</Text>
                <StarRating
                  rating={ratingHost}
                  onRatingChange={setRatingHost}
                />
              </>
            )}

            <Text style={styles.label}>Comentário (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Escreva o seu comentário..."
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  container: { alignItems: "center" },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: COLORS.textLight,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    marginTop: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  cancelText: { color: "#666", fontWeight: "600" },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    marginLeft: 8,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
