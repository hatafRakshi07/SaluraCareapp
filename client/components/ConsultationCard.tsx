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
import type { Consultation } from "@/lib/consultations";

interface ConsultationCardProps {
  consultation: Consultation;
  onCancel: (id: string) => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function ConsultationCard({ consultation, onCancel }: ConsultationCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusColor = () => {
    switch (consultation.status) {
      case "confirmed":
        return Colors.light.success;
      case "cancelled":
        return Colors.light.error;
      case "pending":
      default:
        return Colors.light.warning;
    }
  };

  const getStatusLabel = () => {
    switch (consultation.status) {
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "pending":
      default:
        return "Pending";
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel(consultation.id);
  };

  const formattedDate = new Date(consultation.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatedView
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
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
          <Feather name="video" size={22} color={theme.primary} />
        </View>
        <View style={styles.headerInfo}>
          <ThemedText type="body" style={styles.typeName}>
            {consultation.consultationType}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {consultation.fullName}
          </ThemedText>
        </View>
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
            style={{ color: getStatusColor(), fontWeight: "600" }}
          >
            {getStatusLabel()}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.detailsRow, { borderTopColor: theme.divider }]}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            {formattedDate}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            {consultation.timeSlot}
          </ThemedText>
        </View>
      </View>

      {consultation.message.length > 0 ? (
        <ThemedText
          type="small"
          style={[styles.message, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {consultation.message}
        </ThemedText>
      ) : null}

      {consultation.status === "pending" ? (
        <Pressable
          onPress={handleCancel}
          style={[
            styles.cancelButton,
            { borderColor: Colors.light.error },
          ]}
          testID={`button-cancel-${consultation.id}`}
        >
          <Feather name="x" size={14} color={Colors.light.error} />
          <ThemedText
            type="small"
            style={{ color: Colors.light.error, fontWeight: "600", marginLeft: Spacing.xs }}
          >
            Cancel Appointment
          </ThemedText>
        </Pressable>
      ) : null}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  typeName: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
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
  detailsRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.xl,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  message: {
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
  },
});
