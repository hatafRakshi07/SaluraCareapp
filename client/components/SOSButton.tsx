import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, BorderRadius, Shadows, Spacing } from "@/constants/theme";

interface SOSButtonProps {
  onPress: () => void;
  bottomOffset?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SOSButton({ onPress, bottomOffset = 90 }: SOSButtonProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onPress();
  };

  return (
    <View
      style={[
        styles.container,
        { bottom: bottomOffset + insets.bottom },
      ]}
    >
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, animatedStyle]}
        testID="button-sos"
      >
        <Feather name="alert-circle" size={28} color="#FFFFFF" />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 1000,
  },
  pulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.sos,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.sos,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sos,
  },
});
