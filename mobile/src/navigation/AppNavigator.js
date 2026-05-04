import React from "react";
import HostBookingsScreen from "../screens/HostBookingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

import { ChatbotProvider } from "../contexts/ChatbotContext";
import ChatbotModal from "../components/ChatbotModal";
import FloatingChatButton from "../components/FloatingChatButton";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import PlaceDetailScreen from "../screens/PlaceDetailScreen";
import BookingsScreen from "../screens/BookingsScreen";
import CheckInScreen from "../screens/CheckInScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MyPlacesScreen from "../screens/MyPlacesScreen";
import SupportScreen from "../screens/SupportScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ConversationScreen from "../screens/ConversationScreen";
import HostReviewsScreen from "../screens/HostReviewsScreen";
import PlaceFormScreen from "../screens/PlaceFormScreen";
import ChangeEmailScreen from "../screens/ChangeEmailScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="PlaceForm" component={PlaceFormScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsMain" component={BookingsScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesMain" component={MessagesScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="MyPlaces" component={MyPlacesScreen} />
      <Stack.Screen name="HostReviews" component={HostReviewsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="HostBookings" component={HostBookingsScreen} />
    </Stack.Navigator>
  );
}

// ✅ Nova stack para "Meus Anúncios" como aba independente
function MyPlacesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPlacesMain" component={MyPlacesScreen} />
      {/* Se mais tarde quiser adicionar um ecrã de detalhe do anúncio a partir daqui, pode fazê‑lo */}
    </Stack.Navigator>
  );
}

// ---------- Tab Navigator ----------

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "BookingsTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "MessagesTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "MyPlacesTab") {
            iconName = focused ? "albums" : "albums-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#e53935",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: "Início" }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStack}
        options={{ tabBarLabel: "Reservas" }}
      />
      {/* ✅ Nova aba Meus Anúncios */}
      <Tab.Screen
        name="MyPlacesTab"
        component={MyPlacesStack}
        options={{ tabBarLabel: "Anúncios" }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{ tabBarLabel: "Mensagens" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

// ---------- Autenticação ----------

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

function MainApp() {
  return (
    <ChatbotProvider>
      <TabNavigator />
      <FloatingChatButton />
      <ChatbotModal />
    </ChatbotProvider>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? <MainApp /> : <AuthStack />}
    </NavigationContainer>
  );
}
