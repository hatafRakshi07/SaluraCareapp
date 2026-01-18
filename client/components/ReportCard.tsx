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

interface ReportCardProps {
  id: string;
  testName: string;
  date: string;
  labName: string;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ReportCard({
  id,
  testName,
  date,
  labName,
  onDownload,
  onShare,
}: ReportCardProps) {
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

  const handleDownload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDownload(id);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare(id);
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
          <Feather name="file-text" size={24} color={theme.primary} />
        </View>

        <View style={styles.info}>
          <ThemedText type="body" style={styles.name} numberOfLines={1}>
            {testName}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.lab, { color: theme.textSecondary }]}
          >
            {labName}
          </ThemedText>
          <View style={styles.dateRow}>
            <Feather
              name="calendar"
              size={12}
              color={theme.textSecondary}
            />
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
            >
              {date}
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleDownload}
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="download" size={16} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={handleShare}
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? Colors.dark.backgroundSecondary
                  : Colors.light.backgroundSecondary,
              },
            ]}
          >
            <Feather name="share-2" size={16} color={theme.primary} />
          </Pressable>
        </View>
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
    width: 56,
    height: 56,
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
  lab: {
    marginBottom: Spacing.xs,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
