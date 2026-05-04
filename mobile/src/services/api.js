import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("API Error:", error.response.data);
    } else if (error.request) {
      Alert.alert("Erro de rede", "Verifique a sua ligação à internet.");
    } else {
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    }
    return Promise.reject(error);
  },
);

export default api;
