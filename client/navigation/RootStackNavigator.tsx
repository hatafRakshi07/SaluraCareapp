import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import SOSScreen from "@/screens/SOSScreen";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Main: undefined;
  SOS: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    if (showRegister) {
      return <RegisterScreen onGoToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onGoToRegister={() => setShowRegister(true)} />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SOS"
        component={SOSScreen}
        options={{
          presentation: "modal",
          headerTitle: "Emergency",
          headerTintColor: "#E53935",
        }}
      />
    </Stack.Navigator>
  );
}
