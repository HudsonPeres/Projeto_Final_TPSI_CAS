import Constants from "expo-constants";

const getApiUrl = () => {
  const expoConfig = Constants.expoConfig || Constants.manifest;
  if (expoConfig && expoConfig.extra && expoConfig.extra.API_URL) {
    return expoConfig.extra.API_URL;
  }
  return "http://192.168.1.217:3000";
};

export const API_URL = getApiUrl();
