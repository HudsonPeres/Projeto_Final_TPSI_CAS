import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // verifica se já existe token e se é válido
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (!storedToken) {
          setLoading(false);
          return;
        }
        // Valida o token
        const res = await api.get("/auth/me");
        setToken(storedToken);
        setUser(res.data);
      } catch (err) {
        // limpa se o Token for inválido ou estiver expirado
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  // Solicitar OTP
  const requestOTP = async (email, type, password = null) => {
    const body = { email, type };
    if (password) body.password = password;
    const res = await api.post("/auth/request-otp", body);
    return res.data; // { message }
  };

  // Verificar OTP
  const verifyOTP = async (email, otp, type, name = null, password = null) => {
    const body = { email, otp, type };
    if (name) body.name = name;
    if (password) body.password = password;

    const res = await api.post("/auth/verify-otp", body);
    // resposta do backend
    const userData = res.data;
    const { token: newToken, ...userWithoutToken } = userData;

    setUser(userWithoutToken);
    setToken(newToken);
    await AsyncStorage.setItem("token", newToken);

    return userData;
  };

  // Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        requestOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
