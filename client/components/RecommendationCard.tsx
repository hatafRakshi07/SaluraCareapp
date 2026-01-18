import React from "react";
import { StyleSheet, View, Pressable, ImageBackground } from "react-native";
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

interface RecommendationCardProps {
  id: string;
  title: string;
  description: string;
  type: "article" | "product" | "tip";
  image?: string;
  onPress: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RecommendationCard({
  id,
  title,
  description,
  type,
  image,
  onPress,
}: RecommendationCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const getTypeIcon = (): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "article":
        return "book-open";
      case "product":
        return "shopping-bag";
      case "tip":
        return "zap";
      default:
        return "info";
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "article":
        return "Article";
      case "product":
        return "Product";
      case "tip":
        return "Health Tip";
      default:
        return type;
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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
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
          <ImageBackground
            source={{ uri: image }}
            style={styles.image}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={styles.imageGradient}
            />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryLight]}
            style={styles.placeholderGradient}
          >
            <Feather name={getTypeIcon()} size={40} color="#FFFFFF" />
          </LinearGradient>
        )}
        <View style={styles.typeBadge}>
          <Feather name={getTypeIcon()} size={12} color="#FFFFFF" />
          <ThemedText type="caption" style={styles.typeText}>
            {getTypeLabel()}
          </ThemedText>
        </View>
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.title} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.description, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {description}
        </ThemedText>
        <View style={styles.footer}>
          <ThemedText type="small" style={{ color: theme.primary }}>
            Read more
          </ThemedText>
          <Feather name="arrow-right" size={14} color={theme.primary} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  imageContainer: {
    height: 140,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageStyle: {
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  placeholderGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  typeText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
