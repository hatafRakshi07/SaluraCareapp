import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuthStore } from "@/context/AuthContext";

function AuthFlow() {
  const [screen, setScreen] = useState<"login" | "register">("login");
  if (screen === "register") {
    return <RegisterScreen onNavigateToLogin={() => setScreen("login")} />;
  }
  return <LoginScreen onNavigateToRegister={() => setScreen("register")} />;
}

function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#00B5A5" />
    </View>
  );
}

function AuthenticatedApp() {
  return (
    <KeyboardProvider>
      <NavigationContainer>
        <RootStackNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </KeyboardProvider>
  );
}

// Uses `key` to force a full unmount+remount when auth state changes.
// This bypasses React Native Web's conditional-branch DOM update issues.
function AppContent({ user, isLoading }: { user: { email: string } | null; isLoading: boolean }) {
  if (isLoading) return <LoadingView />;
  if (!user) return <AuthFlow />;
  return <AuthenticatedApp />;
}

function AppNavigator() {
  const { user, isLoading } = useAuthStore();

  // Changing `key` forces a complete DOM replacement when auth state changes,
  // bypassing React Native Web DOM reconciliation issues with conditional branches.
  const appKey = isLoading ? "loading" : user ? "authenticated" : "unauthenticated";

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppContent key={appKey} user={user} isLoading={isLoading} />
      {!isLoading && !user ? null : <StatusBar style="auto" />}
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
