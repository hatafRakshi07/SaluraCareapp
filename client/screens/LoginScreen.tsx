import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../lib/auth";
import { Spacing, BorderRadius } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

interface Props {
  onGoToRegister: () => void;
}

export default function LoginScreen({ onGoToRegister }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await loginUser(email.trim().toLowerCase(), password);
      await login(token, user);
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>SaluraCare</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Your health, our priority</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to your account</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <TextInput
                testID="input-email"
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
              <TextInput
                testID="input-password"
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              testID="button-login"
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity testID="button-go-register" onPress={onGoToRegister}>
            <Text style={[styles.link, { color: theme.primary }]}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: Spacing.lg },
  header: { alignItems: "center", marginBottom: Spacing.xl },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#00B5A5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  logoText: { fontSize: 36, fontWeight: "700", color: "#fff" },
  appName: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  tagline: { fontSize: 14 },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: Spacing.xl },
  form: { gap: Spacing.md },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500" },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  button: {
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: "600" },
});
