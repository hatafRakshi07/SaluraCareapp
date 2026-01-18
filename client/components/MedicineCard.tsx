import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
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

interface MedicineCardProps {
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  onMarkTaken: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MedicineCard({
  name,
  dosage,
  time,
  taken,
  onMarkTaken,
}: MedicineCardProps) {
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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMarkTaken();
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
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? Colors.dark.backgroundSecondary
                : Colors.light.backgroundSecondary,
            },
          ]}
        >
          <Feather name="package" size={20} color={theme.primary} />
        </View>
        <View style={styles.info}>
          <ThemedText type="body" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.dosage, { color: theme.textSecondary }]}
          >
            {dosage}
          </ThemedText>
          <View style={styles.timeRow}>
            <Feather
              name="clock"
              size={12}
              color={theme.textSecondary}
              style={styles.timeIcon}
            />
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary }}
            >
              {time}
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={handlePress}
          style={[
            styles.actionButton,
            {
              backgroundColor: taken ? theme.success : theme.primary,
            },
          ]}
        >
          <Feather
            name={taken ? "check" : "circle"}
            size={18}
            color="#FFFFFF"
          />
          <ThemedText type="caption" style={styles.actionText}>
            {taken ? "Done" : "Take"}
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  dosage: {
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: Spacing.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
