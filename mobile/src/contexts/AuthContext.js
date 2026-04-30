import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (!storedToken) {
          setLoading(false);
          return;
        }
        const res = await api.get("/auth/me");
        setToken(storedToken);
        setUser(res.data);
      } catch (err) {
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const requestOTP = async (email, type, password = null) => {
    const body = { email, type };
    if (password) body.password = password;
    const res = await api.post("/auth/request-otp", body);
    return res.data;
  };

  const verifyOTP = async (email, otp, type, name = null, password = null) => {
    const body = { email, otp, type };
    if (name) body.name = name;
    if (password) body.password = password;

    const res = await api.post("/auth/verify-otp", body);
    const userData = res.data;
    const { token: newToken, ...userWithoutToken } = userData;

    setUser(userWithoutToken);
    setToken(newToken);
    await AsyncStorage.setItem("token", newToken);

    return userData;
  };

  // 🔥 Nova função para login com Google
  const googleSignIn = async (idToken) => {
    const res = await api.post("/auth/google/mobile", { idToken });
    const userData = res.data;
    const { token: newToken, ...userWithoutToken } = userData;

    setUser(userWithoutToken);
    setToken(newToken);
    await AsyncStorage.setItem("token", newToken);
    // Navegação automática porque o estado user muda
  };

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
        googleSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
