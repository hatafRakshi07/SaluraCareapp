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
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors } from "@/constants/theme";
import type { Specialty } from "@/lib/doctors";

interface SpecialtyCardProps {
  specialty: Specialty;
  onPress: (specialty: Specialty) => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpecialtyCard({ specialty, onPress }: SpecialtyCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress(specialty)}
      onPressIn={() => {
        scale.value = withSpring(0.95, springConfig);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springConfig);
      }}
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        animatedStyle,
      ]}
      testID={`specialty-card-${specialty.id}`}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? Colors.dark.backgroundSecondary
              : theme.primary + "12",
          },
        ]}
      >
        <Feather
          name={specialty.icon}
          size={24}
          color={theme.primary}
        />
      </View>
      <ThemedText
        type="caption"
        style={styles.label}
        numberOfLines={2}
      >
        {specialty.name}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "30%",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 16,
  },
});
