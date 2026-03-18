import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { getUserBookings } from "../lib/auth";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius } from "../constants/theme";
import { useQuery } from "@tanstack/react-query";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings", user?.id],
    queryFn: getUserBookings,
    enabled: !!user,
  });

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: logout },
      ]
    );
  };

  const styles = createStyles(colors);

  const statusColor = (status: string) => {
    if (status === "confirmed") return "#22c55e";
    if (status === "pending") return "#f59e0b";
    return colors.textSecondary;
  };

  const typeIcon = (type: string): any => {
    if (type === "lab") return "activity";
    if (type === "vaccine") return "shield";
    if (type === "service") return "users";
    return "calendar";
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg, paddingBottom: tabBarHeight + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          {user?.isPremium ? (
            <View style={styles.premiumBadge}>
              <Feather name="star" size={12} color="#fff" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>My Bookings</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : bookings && bookings.length > 0 ? (
        <View style={styles.bookingsList}>
          {bookings.map((booking: any) => (
            <View key={booking.id} style={[styles.bookingCard, { backgroundColor: colors.card }]}>
              <View style={[styles.bookingIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name={typeIcon(booking.type)} size={18} color={colors.primary} />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={[styles.bookingName, { color: colors.text }]}>{booking.item_name}</Text>
                <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>
                  {booking.scheduled_date ? `${booking.scheduled_date}${booking.scheduled_time ? " at " + booking.scheduled_time : ""}` : "Awaiting schedule"}
                </Text>
                <Text style={[styles.bookingAmount, { color: colors.textSecondary }]}>${booking.amount}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(booking.status) + "20" }]}>
                <Text style={[styles.statusText, { color: statusColor(booking.status) }]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyBookings, { backgroundColor: colors.card }]}>
          <Feather name="calendar" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bookings yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Book a lab test, vaccine, or service to see it here
          </Text>
        </View>
      )}

      <TouchableOpacity
        testID="button-logout"
        style={[styles.logoutButton, { backgroundColor: colors.card }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color="#E53935" />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    content: { paddingHorizontal: Spacing.lg },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.xl,
      gap: Spacing.md,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#00B5A5",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 26, fontWeight: "700", color: "#fff" },
    profileInfo: { flex: 1 },
    userName: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
    userEmail: { fontSize: 13, marginBottom: 6 },
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#00B5A5",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: "flex-start",
    },
    premiumText: { color: "#fff", fontSize: 11, fontWeight: "600" },
    sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: Spacing.md },
    bookingsList: { gap: Spacing.sm, marginBottom: Spacing.xl },
    bookingCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      gap: Spacing.sm,
    },
    bookingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    bookingInfo: { flex: 1 },
    bookingName: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
    bookingMeta: { fontSize: 12, marginBottom: 2 },
    bookingAmount: { fontSize: 12 },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: { fontSize: 11, fontWeight: "600" },
    emptyBookings: {
      alignItems: "center",
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      gap: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    emptyText: { fontSize: 16, fontWeight: "600" },
    emptySubtext: { fontSize: 13, textAlign: "center" },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
    },
    logoutText: { color: "#E53935", fontSize: 15, fontWeight: "600" },
  });
}
