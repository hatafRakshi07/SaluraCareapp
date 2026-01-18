import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, Colors } from "@/constants/theme";

interface ServiceProviderCardProps {
  id: string;
  name: string;
  role: string;
  experience: number;
  available: boolean;
  rating: number;
  image?: string;
  onBook: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ServiceProviderCard({
  id,
  name,
  role,
  experience,
  available,
  rating,
  image,
  onBook,
}: ServiceProviderCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleBook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBook(id);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: isDark
                    ? Colors.dark.backgroundSecondary
                    : Colors.light.backgroundSecondary,
                },
              ]}
            >
              <Feather name="user" size={28} color={theme.primary} />
            </View>
          )}
          {available ? (
            <View style={styles.availabilityDot} />
          ) : null}
        </View>

        <View style={styles.info}>
          <ThemedText type="body" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.role, { color: theme.primary }]}
          >
            {role}
          </ThemedText>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Feather
                name="briefcase"
                size={12}
                color={theme.textSecondary}
              />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
              >
                {experience} years
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <Feather name="star" size={12} color={Colors.light.warning} />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
              >
                {rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleBook}
          style={[
            styles.bookButton,
            {
              backgroundColor: available ? theme.primary : theme.backgroundSecondary,
            },
          ]}
          disabled={!available}
        >
          <ThemedText
            type="small"
            style={[
              styles.bookText,
              { color: available ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            {available ? "Book" : "Unavailable"}
          </ThemedText>
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  availabilityDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  role: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  details: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xs,
  },
  bookText: {
    fontWeight: "600",
  },
});
