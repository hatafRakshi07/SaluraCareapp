import React, { useState } from "react";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { OrderCard } from "@/components/OrderCard";
import { ReportCard } from "@/components/ReportCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";

interface Order {
  id: string;
  productName: string;
  date: string;
  status: "delivered" | "in_transit" | "processing";
  price: number;
}

interface Report {
  id: string;
  testName: string;
  date: string;
  labName: string;
}

const ORDERS: Order[] = [
  { id: "1", productName: "N95 Face Masks (50 Pack)", date: "Jan 15, 2026", status: "delivered", price: 24.99 },
  { id: "2", productName: "Blood Pressure Monitor", date: "Jan 12, 2026", status: "in_transit", price: 49.99 },
  { id: "3", productName: "Sterile Gauze Pads", date: "Jan 10, 2026", status: "delivered", price: 8.99 },
];

const REPORTS: Report[] = [
  { id: "1", testName: "Complete Blood Count (CBC)", date: "Jan 14, 2026", labName: "PathLab Diagnostics" },
  { id: "2", testName: "Lipid Profile", date: "Jan 8, 2026", labName: "City Medical Lab" },
  { id: "3", testName: "HbA1c Test", date: "Dec 28, 2025", labName: "HealthFirst Labs" },
];

export default function ReorderScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [selectedSegment, setSelectedSegment] = useState(0);

  const handleReorder = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log("Reorder:", id);
  };

  const handleDownload = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Download:", id);
  };

  const handleShare = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Share:", id);
  };

  const handleUpload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log("Upload report");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="h2">History</ThemedText>
      <SegmentedControl
        segments={["Orders", "Reports"]}
        selectedIndex={selectedSegment}
        onSelect={setSelectedSegment}
      />
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard
      id={item.id}
      productName={item.productName}
      date={item.date}
      status={item.status}
      price={item.price}
      onReorder={handleReorder}
    />
  );

  const renderReportItem = ({ item }: { item: Report }) => (
    <ReportCard
      id={item.id}
      testName={item.testName}
      date={item.date}
      labName={item.labName}
      onDownload={handleDownload}
      onShare={handleShare}
    />
  );

  const renderEmptyOrders = () => (
    <EmptyState
      image={require("../../assets/images/illustrations/empty_orders_illustration.png")}
      title="No Orders Yet"
      description="Your order history will appear here once you make a purchase."
      actionLabel="Start Shopping"
      onAction={() => console.log("Go to shop")}
    />
  );

  const renderEmptyReports = () => (
    <EmptyState
      image={require("../../assets/images/illustrations/empty_reports_illustration.png")}
      title="No Reports Uploaded"
      description="Upload your medical reports to keep them organized and accessible."
      actionLabel="Upload Report"
      onAction={handleUpload}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {selectedSegment === 0 ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: tabBarHeight + Spacing["5xl"],
            },
            ORDERS.length === 0 && styles.emptyContent,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          data={ORDERS}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyOrders}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: tabBarHeight + Spacing["5xl"],
            },
            REPORTS.length === 0 && styles.emptyContent,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          data={REPORTS}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyReports}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedSegment === 1 ? (
        <Pressable
          onPress={handleUpload}
          style={[
            styles.uploadButton,
            { bottom: tabBarHeight + Spacing["4xl"] },
          ]}
        >
          <Feather name="upload" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    position: "absolute",
    right: Spacing.lg + 70,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
});
