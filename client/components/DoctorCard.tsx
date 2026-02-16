import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors, Shadows } from "@/constants/theme";
import type { Doctor } from "@/lib/doctors";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <AnimatedView
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primary + "20" },
          ]}
        >
          <ThemedText
            type="h4"
            style={{ color: theme.primary, fontWeight: "700" }}
          >
            {initials}
          </ThemedText>
        </View>

        <View style={styles.info}>
          <ThemedText type="body" style={styles.name}>
            {doctor.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {doctor.qualification}
          </ThemedText>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="briefcase" size={12} color={theme.textSecondary} />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: 4 }}
              >
                {doctor.experience} yrs
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="star" size={12} color={Colors.light.warning} />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: 4 }}
              >
                {doctor.rating}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <ThemedText
        type="small"
        style={[styles.about, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {doctor.about}
      </ThemedText>

      <Button
        onPress={() => onBook(doctor)}
        style={styles.bookButton}
      >
        Book Consultation
      </Button>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: Spacing.xs,
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  about: {
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  bookButton: {
    marginTop: Spacing.lg,
  },
});
