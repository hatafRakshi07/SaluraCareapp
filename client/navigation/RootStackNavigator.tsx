import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import SOSScreen from "@/screens/SOSScreen";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import type { RootStackParamList } from "@/navigation/types";
import type { AuthUser } from "@/lib/auth";

export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  user: AuthUser | null;
  isLoading: boolean;
}

export default function RootStackNavigator({ user, isLoading }: Props) {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  console.log("[RootNav] render user=", user?.email ?? null, "isLoading=", isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {user ? (
        <>
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
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
