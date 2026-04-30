import Constants from "expo-constants";

const getApiUrl = () => {
  // Compatibilidade com várias versões do Expo
  const expoConfig = Constants.expoConfig || Constants.manifest;
  if (expoConfig && expoConfig.extra && expoConfig.extra.API_URL) {
    return expoConfig.extra.API_URL;
  }
  // Fallback (troque pelo seu IP se não estiver a usar o app.json)
  return "http://192.168.1.217:3000";
};

export const API_URL = getApiUrl();
