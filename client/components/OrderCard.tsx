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

interface OrderCardProps {
  id: string;
  productName: string;
  date: string;
  status: "delivered" | "in_transit" | "processing";
  price: number;
  image?: string;
  onReorder: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OrderCard({
  id,
  productName,
  date,
  status,
  price,
  image,
  onReorder,
}: OrderCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const getStatusColor = () => {
    switch (status) {
      case "delivered":
        return Colors.light.success;
      case "in_transit":
        return Colors.light.warning;
      case "processing":
        return Colors.light.primary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_transit":
        return "In Transit";
      case "processing":
        return "Processing";
      default:
        return status;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleReorder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReorder(id);
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
            styles.imageContainer,
            {
              backgroundColor: isDark
                ? Colors.dark.backgroundSecondary
                : Colors.light.backgroundSecondary,
            },
          ]}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Feather name="box" size={24} color={theme.primary} />
          )}
        </View>

        <View style={styles.info}>
          <ThemedText type="body" style={styles.name} numberOfLines={1}>
            {productName}
          </ThemedText>
          <View style={styles.row}>
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
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() + "20" },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
              />
              <ThemedText
                type="caption"
                style={{ color: getStatusColor(), fontWeight: "500" }}
              >
                {getStatusLabel()}
              </ThemedText>
            </View>
            <ThemedText type="body" style={[styles.price, { color: theme.primary }]}>
              ${price.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={handleReorder}
          style={[styles.reorderButton, { borderColor: theme.primary }]}
        >
          <Feather name="refresh-cw" size={16} color={theme.primary} />
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
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.sm,
    resizeMode: "cover",
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  price: {
    fontWeight: "600",
  },
  reorderButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
});
