import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

interface SOSScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, "SOS">;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "1", name: "John Johnson", phone: "+1 555-0123", relation: "Spouse" },
  { id: "2", name: "Dr. Smith", phone: "+1 555-0456", relation: "Doctor" },
  { id: "3", name: "Emergency", phone: "911", relation: "Emergency" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SOSScreen({ navigation }: SOSScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();

  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRequestAmbulance = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
    setAmbulanceRequested(true);
  };

  const handleCallContact = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const phoneNumber = Platform.OS === "ios" ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(phoneNumber);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl },
        ]}
      >
        <View style={styles.headerSection}>
          <ThemedText type="h2" style={styles.title}>
            Emergency SOS
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            {ambulanceRequested
              ? "Help is on the way!"
              : "Press the button to request immediate assistance"}
          </ThemedText>
        </View>

        <View style={styles.sosSection}>
          {!ambulanceRequested ? (
            <View style={styles.sosButtonContainer}>
              <Animated.View style={[styles.pulse, pulseStyle]} />
              <Animated.View style={[styles.pulseOuter, pulseStyle]} />
              <AnimatedPressable
                onPress={handleRequestAmbulance}
                style={[styles.sosButton, buttonStyle]}
              >
                <Feather name="phone-call" size={48} color="#FFFFFF" />
                <ThemedText type="h3" style={styles.sosButtonText}>
                  Request Ambulance
                </ThemedText>
              </AnimatedPressable>
            </View>
          ) : (
            <View style={styles.trackingSection}>
              <View
                style={[
                  styles.trackingCard,
                  { backgroundColor: theme.cardBackground },
                  Shadows.card,
                ]}
              >
                <View style={styles.trackingHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: Colors.light.success },
                    ]}
                  />
                  <ThemedText type="h4">Ambulance Dispatched</ThemedText>
                </View>
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                >
                  Estimated arrival: 8-12 minutes
                </ThemedText>
                <View style={styles.trackingDetails}>
                  <View style={styles.trackingItem}>
                    <Feather name="truck" size={20} color={theme.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.sm }}>
                      Unit #142
                    </ThemedText>
                  </View>
                  <View style={styles.trackingItem}>
                    <Feather name="map-pin" size={20} color={theme.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.sm }}>
                      2.3 km away
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.contactsSection}>
          <ThemedText type="h4" style={styles.contactsTitle}>
            Emergency Contacts
          </ThemedText>
          {EMERGENCY_CONTACTS.map((contact) => (
            <Pressable
              key={contact.id}
              onPress={() => handleCallContact(contact.phone)}
              style={[
                styles.contactCard,
                { backgroundColor: theme.cardBackground },
                Shadows.card,
              ]}
            >
              <View
                style={[
                  styles.contactAvatar,
                  {
                    backgroundColor: isDark
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name={contact.relation === "Emergency" ? "phone" : "user"}
                  size={20}
                  color={
                    contact.relation === "Emergency"
                      ? Colors.light.error
                      : theme.primary
                  }
                />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText type="body" style={styles.contactName}>
                  {contact.name}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {contact.relation} - {contact.phone}
                </ThemedText>
              </View>
              <Feather name="phone" size={20} color={theme.primary} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  sosSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  sosButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.error,
  },
  pulseOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.error,
    opacity: 0.3,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.error,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sos,
  },
  sosButtonText: {
    color: "#FFFFFF",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  trackingSection: {
    width: "100%",
  },
  trackingCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  trackingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  trackingDetails: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  trackingItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactsSection: {
    flex: 1,
  },
  contactsTitle: {
    marginBottom: Spacing.lg,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
});
