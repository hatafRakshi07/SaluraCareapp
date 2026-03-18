import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { createPaymentIntent } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";
import { LAB_TESTS, TIME_SLOTS, LabTest } from "@/lib/labTests";

const CATEGORIES = ["All", "Blood", "Thyroid", "Organ Function", "Urine", "Vitamins", "Inflammation"];

function LabTestCard({
  test,
  onBook,
  index,
}: {
  test: LabTest;
  onBook: (test: LabTest) => void;
  index: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.testCard, { backgroundColor: theme.cardBackground }, Shadows.card]}
          testID={`card-labtest-${test.id}`}
        >
          <View style={styles.testCardHeader}>
            <View style={[styles.testIconBg, { backgroundColor: theme.primary + "18" }]}>
              <Feather name="activity" size={20} color={theme.primary} />
            </View>
            {test.popular ? (
              <View style={[styles.popularBadge, { backgroundColor: theme.primary + "20" }]}>
                <ThemedText style={[styles.popularText, { color: theme.primary }]}>Popular</ThemedText>
              </View>
            ) : null}
          </View>

          <ThemedText type="h4" style={styles.testName}>{test.name}</ThemedText>
          <ThemedText type="small" style={[styles.testDesc, { color: theme.textSecondary }]}>
            {test.description}
          </ThemedText>

          <View style={styles.testMeta}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={13} color={theme.textSecondary} />
              <ThemedText type="small" style={[styles.metaText, { color: theme.textSecondary }]}>
                {test.duration}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="tag" size={13} color={theme.textSecondary} />
              <ThemedText type="small" style={[styles.metaText, { color: theme.textSecondary }]}>
                {test.category}
              </ThemedText>
            </View>
          </View>

          <View style={styles.testFooter}>
            <View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Price</ThemedText>
              <ThemedText type="h3" style={{ color: theme.primary }}>₹{test.price}</ThemedText>
            </View>
            <Pressable
              onPress={() => onBook(test)}
              style={[styles.bookButton, { backgroundColor: theme.primary }]}
              testID={`button-book-${test.id}`}
            >
              <ThemedText style={styles.bookButtonText}>Book Test</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function BookingModal({
  visible,
  test,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  test: LabTest | null;
  onClose: () => void;
  onConfirm: (date: string, time: string, address: string) => void;
}) {
  const { theme, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        full: d.toDateString(),
      });
    }
    return result;
  }, []);

  const handleConfirm = () => {
    if (!selectedTime || !address.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dateStr = dates[selectedDate]?.full ?? new Date().toDateString();
    onConfirm(dateStr, selectedTime, address);
    setSelectedDate(0);
    setSelectedTime("");
    setAddress("");
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={onClose} testID="button-close-modal">
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">Book Lab Test</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {test ? (
            <View style={[styles.selectedTestCard, { backgroundColor: theme.primary + "15" }]}>
              <ThemedText type="h4">{test.name}</ThemedText>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "700" }}>
                ₹{test.price}
              </ThemedText>
            </View>
          ) : null}

          <ThemedText type="h4" style={styles.sectionLabel}>Select Date</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesRow}>
            {dates.map((d, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedDate(i)}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: selectedDate === i ? theme.primary : theme.cardBackground,
                    borderColor: selectedDate === i ? theme.primary : theme.border,
                  },
                  Shadows.card,
                ]}
                testID={`chip-date-${i}`}
              >
                <ThemedText
                  type="small"
                  style={{ color: selectedDate === i ? "#FFF" : theme.textSecondary, fontWeight: "600" }}
                >
                  {d.label}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: selectedDate === i ? "#FFF" : theme.text, fontWeight: "700" }}
                >
                  {d.date}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <ThemedText type="h4" style={styles.sectionLabel}>Select Time Slot</ThemedText>
          <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((slot) => (
              <Pressable
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: selectedTime === slot ? theme.primary : theme.cardBackground,
                    borderColor: selectedTime === slot ? theme.primary : theme.border,
                  },
                ]}
                testID={`chip-time-${slot}`}
              >
                <ThemedText
                  type="small"
                  style={{ color: selectedTime === slot ? "#FFF" : theme.text, fontWeight: "600" }}
                >
                  {slot}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText type="h4" style={styles.sectionLabel}>Collection Address</ThemedText>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your home address for sample collection"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            style={[
              styles.addressInput,
              {
                backgroundColor: theme.cardBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            testID="input-address"
          />

          <Pressable
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              {
                backgroundColor:
                  selectedTime && address.trim() ? theme.primary : theme.border,
              },
            ]}
            testID="button-confirm-booking"
          >
            <ThemedText style={styles.confirmButtonText}>Confirm Booking</ThemedText>
          </Pressable>

          <View style={{ height: Spacing["3xl"] }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function SuccessModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.successOverlay}>
        <Animated.View
          entering={FadeIn.springify()}
          style={[styles.successCard, { backgroundColor: theme.cardBackground }]}
        >
          <View style={[styles.successIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <Feather name="check-circle" size={48} color={Colors.light.success} />
          </View>
          <ThemedText type="h3" style={styles.successTitle}>Booking Confirmed!</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Our sample collection team will visit your address at the selected time.
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={[styles.successButton, { backgroundColor: theme.primary }]}
            testID="button-success-close"
          >
            <ThemedText style={styles.confirmButtonText}>Done</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function LabTestScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookingTest, setBookingTest] = useState<LabTest | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const filteredTests = useMemo(() => {
    return LAB_TESTS.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleBook = (test: LabTest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBookingTest(test);
    setShowBooking(true);
  };

  const handleConfirm = async (date: string, time: string, address: string) => {
    if (!bookingTest || isBooking) return;
    setIsBooking(true);
    try {
      await createPaymentIntent(
        {
          serviceType: "lab_test",
          serviceName: bookingTest.name,
          amount: bookingTest.price,
          scheduledDate: date,
          scheduledTime: time,
          address,
        },
        token ?? ""
      );
    } catch (e) {
      console.warn("Booking API error:", e);
    } finally {
      setIsBooking(false);
    }
    setShowBooking(false);
    setShowSuccess(true);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.screenHeader}>
        <ThemedText type="h2">Lab Tests</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Book home sample collection
        </ThemedText>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tests..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
          testID="input-search"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={16} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === cat ? theme.primary : theme.cardBackground,
                borderColor: selectedCategory === cat ? theme.primary : theme.border,
              },
            ]}
            testID={`chip-category-${cat}`}
          >
            <ThemedText
              type="small"
              style={{
                color: selectedCategory === cat ? "#FFF" : theme.text,
                fontWeight: "600",
              }}
            >
              {cat}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ThemedText type="body" style={[styles.resultCount, { color: theme.textSecondary }]}>
        {filteredTests.length} {filteredTests.length === 1 ? "test" : "tests"} available
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredTests}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LabTestCard test={item} onBook={handleBook} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={theme.textSecondary} />
            <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>No tests found</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              Try a different search or category
            </ThemedText>
          </View>
        }
      />

      <BookingModal
        visible={showBooking}
        test={bookingTest}
        onClose={() => setShowBooking(false)}
        onConfirm={handleConfirm}
      />
      <SuccessModal visible={showSuccess} onClose={() => setShowSuccess(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenHeader: { marginBottom: Spacing.lg },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoriesRow: { marginBottom: Spacing.md, marginHorizontal: -Spacing.lg },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  resultCount: { marginBottom: Spacing.md },
  testCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  testCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  testIconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  popularBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  popularText: { fontSize: 11, fontWeight: "700" },
  testName: { marginBottom: Spacing.xs },
  testDesc: { marginBottom: Spacing.md, lineHeight: 20 },
  testMeta: { flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.lg },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  testFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bookButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  bookButtonText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: Spacing["3xl"], gap: Spacing.sm },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalScroll: { flex: 1, paddingHorizontal: Spacing.lg },
  selectedTestCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  datesRow: { marginBottom: Spacing.sm },
  dateChip: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 60,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  addressInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    textAlignVertical: "top",
    minHeight: 80,
  },
  confirmButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  confirmButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  successCard: {
    width: "100%",
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    gap: Spacing.lg,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { textAlign: "center" },
  successButton: {
    width: "100%",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    marginTop: Spacing.md,
  },
});
