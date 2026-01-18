import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, Colors } from "@/constants/theme";

interface HealthCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  progress?: number;
  progressLabel?: string;
  onPress?: () => void;
  gradient?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  completed?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HealthCard({
  title,
  subtitle,
  icon,
  progress,
  progressLabel,
  onPress,
  gradient = false,
  actionLabel,
  onAction,
  completed = false,
}: HealthCardProps) {
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

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAction?.();
  };

  const cardContent = (
    <>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: gradient
                ? "rgba(255,255,255,0.2)"
                : isDark
                ? Colors.dark.backgroundSecondary
                : Colors.light.backgroundSecondary,
            },
          ]}
        >
          <Feather
            name={icon}
            size={20}
            color={gradient ? "#FFFFFF" : theme.primary}
          />
        </View>
        <View style={styles.headerText}>
          <ThemedText
            type="h4"
            style={[styles.title, gradient && styles.whiteText]}
          >
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              type="small"
              style={[
                styles.subtitle,
                { color: gradient ? "rgba(255,255,255,0.8)" : theme.textSecondary },
              ]}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {completed ? (
          <View style={styles.completedBadge}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      {progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: gradient
                  ? "rgba(255,255,255,0.3)"
                  : theme.backgroundSecondary,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: gradient ? "#FFFFFF" : theme.primary,
                },
              ]}
            />
          </View>
          {progressLabel ? (
            <ThemedText
              type="caption"
              style={[
                styles.progressLabel,
                { color: gradient ? "rgba(255,255,255,0.8)" : theme.textSecondary },
              ]}
            >
              {progressLabel}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {actionLabel ? (
        <Pressable
          onPress={handleAction}
          style={[
            styles.actionButton,
            {
              backgroundColor: gradient
                ? "rgba(255,255,255,0.2)"
                : theme.primary,
            },
          ]}
        >
          <ThemedText type="small" style={styles.actionText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </>
  );

  if (gradient) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.cardWrapper, animatedStyle]}
      >
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, Shadows.card]}
        >
          {cardContent}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.cardWrapper,
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.card,
        animatedStyle,
      ]}
    >
      {cardContent}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  whiteText: {
    color: "#FFFFFF",
  },
  subtitle: {
    opacity: 0.8,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.success,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressLabel: {
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  actionButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
