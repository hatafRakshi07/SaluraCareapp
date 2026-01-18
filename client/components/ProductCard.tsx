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

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  quantity: string;
  image?: string;
  rentable?: boolean;
  onAddToCart: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({
  id,
  name,
  price,
  quantity,
  image,
  rentable,
  onAddToCart,
}: ProductCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart(id);
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
          <Feather name="box" size={40} color={theme.primary} />
        )}
        {rentable ? (
          <View style={styles.rentBadge}>
            <ThemedText type="caption" style={styles.rentText}>
              Rent
            </ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.name} numberOfLines={2}>
          {name}
        </ThemedText>
        <ThemedText
          type="caption"
          style={[styles.quantity, { color: theme.textSecondary }]}
        >
          {quantity}
        </ThemedText>
        <View style={styles.footer}>
          <ThemedText type="h4" style={[styles.price, { color: theme.primary }]}>
            ${price.toFixed(2)}
          </ThemedText>
          <Pressable
            onPress={handleAddToCart}
            style={[styles.addButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: Spacing.xs,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  imageContainer: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  rentBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.light.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  rentText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  quantity: {
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontWeight: "700",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
