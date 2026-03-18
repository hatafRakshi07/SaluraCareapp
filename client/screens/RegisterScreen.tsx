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
import { registerUser } from "../lib/auth";
import { Spacing, BorderRadius } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

interface Props {
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onGoToLogin }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await registerUser(email.trim().toLowerCase(), name.trim(), password);
      await login(token, user);
    } catch (err: any) {
      Alert.alert("Registration failed", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>SaluraCare</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your health, our priority</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start your health journey</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full name</Text>
              <TextInput
                testID="input-name"
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Jane Doe"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                testID="input-email"
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <TextInput
                testID="input-password"
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              testID="button-register"
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity testID="button-go-login" onPress={onGoToLogin}>
            <Text style={[styles.link, { color: colors.primary }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
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
}
