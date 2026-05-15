import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Colors } from "@/constants/theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  const { theme, isDark } = useTheme();

  const handlePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(index);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? Colors.dark.backgroundSecondary
            : Colors.light.backgroundSecondary,
        },
      ]}
    >
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          onPress={() => handlePress(index)}
          style={[
            styles.segment,
            {
              backgroundColor:
                selectedIndex === index ? theme.cardBackground : "transparent",
            },
          ]}
        >
          <ThemedText
            type="small"
            style={[
              styles.segmentText,
              {
                color:
                  selectedIndex === index ? theme.text : theme.textSecondary,
                fontWeight: selectedIndex === index ? "600" : "400",
              },
            ]}
          >
            {segment}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    textAlign: "center",
  },
});
