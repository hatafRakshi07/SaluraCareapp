import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";
import { VACCINES, TIME_SLOTS, Vaccine } from "@/lib/vaccines";

const CATEGORIES = ["All", "Viral", "Bacterial", "Liver"];

function VaccineCard({
  vaccine,
  onBook,
  index,
}: {
  vaccine: Vaccine;
  onBook: (v: Vaccine) => void;
  index: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={() => { scale.value = withSpring(0.97); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          style={[styles.vaccineCard, { backgroundColor: theme.cardBackground }, Shadows.card]}
          testID={`card-vaccine-${vaccine.id}`}
        >
          <View style={styles.vaccineCardHeader}>
            <View style={[styles.vaccineIconBg, { backgroundColor: vaccine.color + "20" }]}>
              <Feather name="shield" size={20} color={vaccine.color} />
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + "15" }]}>
              <ThemedText style={[styles.categoryText, { color: theme.primary }]}>
                {vaccine.category}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="h4" style={styles.vaccineName}>{vaccine.name}</ThemedText>

          <View style={[styles.ageBadge, { backgroundColor: vaccine.color + "15" }]}>
            <Feather name="users" size={12} color={vaccine.color} />
            <ThemedText style={[styles.ageText, { color: vaccine.color }]}>
              {vaccine.recommendedAge}
            </ThemedText>
          </View>

          <ThemedText type="small" style={[styles.vaccineDesc, { color: theme.textSecondary }]}>
            {vaccine.description}
          </ThemedText>

          <View style={styles.doseInfo}>
            <View style={styles.doseItem}>
              <Feather name="droplet" size={13} color={theme.textSecondary} />
              <ThemedText type="small" style={[styles.doseText, { color: theme.textSecondary }]}>
                {vaccine.doses} {vaccine.doses === 1 ? "dose" : "doses"}
              </ThemedText>
            </View>
            {vaccine.intervalWeeks < 260 ? (
              <View style={styles.doseItem}>
                <Feather name="repeat" size={13} color={theme.textSecondary} />
                <ThemedText type="small" style={[styles.doseText, { color: theme.textSecondary }]}>
                  {vaccine.intervalWeeks < 52
                    ? `${vaccine.intervalWeeks}w apart`
                    : `Every ${Math.round(vaccine.intervalWeeks / 52)}yr`}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={() => onBook(vaccine)}
            style={[styles.bookButton, { backgroundColor: vaccine.color }]}
            testID={`button-book-vaccine-${vaccine.id}`}
          >
            <Feather name="calendar" size={14} color="#FFF" />
            <ThemedText style={styles.bookButtonText}>Book Vaccination</ThemedText>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function BookingModal({
  visible,
  vaccine,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  vaccine: Vaccine | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDose, setSelectedDose] = useState(1);
  const [location, setLocation] = useState("");

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      });
    }
    return result;
  }, []);

  const handleConfirm = () => {
    if (!selectedTime || !location.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
    setSelectedDate(0);
    setSelectedTime("");
    setLocation("");
    setSelectedDose(1);
  };

  const doses = vaccine ? Array.from({ length: vaccine.doses }, (_, i) => i + 1) : [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={onClose} testID="button-close-vaccine-modal">
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">Book Vaccination</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {vaccine ? (
            <View style={[styles.selectedVaccineCard, { backgroundColor: (vaccine.color) + "15" }]}>
              <View style={[styles.vaccineIconBg, { backgroundColor: vaccine.color + "25" }]}>
                <Feather name="shield" size={22} color={vaccine.color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4">{vaccine.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {vaccine.doses} {vaccine.doses === 1 ? "dose" : "doses"} required
                </ThemedText>
              </View>
            </View>
          ) : null}

          {doses.length > 1 ? (
            <>
              <ThemedText type="h4" style={styles.sectionLabel}>Dose Number</ThemedText>
              <View style={styles.dosesRow}>
                {doses.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setSelectedDose(d)}
                    style={[
                      styles.doseChip,
                      {
                        backgroundColor: selectedDose === d ? theme.primary : theme.cardBackground,
                        borderColor: selectedDose === d ? theme.primary : theme.border,
                      },
                    ]}
                    testID={`chip-dose-${d}`}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: selectedDose === d ? "#FFF" : theme.text, fontWeight: "700" }}
                    >
                      Dose {d}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
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

          <ThemedText type="h4" style={styles.sectionLabel}>Select Time</ThemedText>
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

          <ThemedText type="h4" style={styles.sectionLabel}>Vaccination Centre / Location</ThemedText>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter clinic name or your address for home visit"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            style={[
              styles.locationInput,
              {
                backgroundColor: theme.cardBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            testID="input-location"
          />

          <Pressable
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              {
                backgroundColor:
                  selectedTime && location.trim() ? theme.primary : theme.border,
              },
            ]}
            testID="button-confirm-vaccine-booking"
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
            <Feather name="shield" size={48} color={Colors.light.success} />
          </View>
          <ThemedText type="h3" style={styles.successTitle}>Vaccination Booked!</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            You will receive a reminder before your appointment. Stay protected!
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={[styles.successButton, { backgroundColor: theme.primary }]}
            testID="button-vaccine-success-close"
          >
            <ThemedText style={styles.confirmButtonText}>Done</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function VaccinationScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookingVaccine, setBookingVaccine] = useState<Vaccine | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredVaccines = useMemo(() => {
    return VACCINES.filter(
      (v) => selectedCategory === "All" || v.category === selectedCategory
    );
  }, [selectedCategory]);

  const handleBook = (vaccine: Vaccine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBookingVaccine(vaccine);
    setShowBooking(true);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.screenHeader}>
        <ThemedText type="h2">Vaccination</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Stay protected with timely vaccines
        </ThemedText>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.primary + "15" }]}>
        <View style={[styles.infoIconBg, { backgroundColor: theme.primary + "25" }]}>
          <Feather name="info" size={18} color={theme.primary} />
        </View>
        <ThemedText type="small" style={{ color: theme.primary, flex: 1, lineHeight: 18 }}>
          Keep your vaccination records up to date. Tap "Book Vaccination" to schedule your appointment.
        </ThemedText>
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
            testID={`chip-vacc-category-${cat}`}
          >
            <ThemedText
              type="small"
              style={{ color: selectedCategory === cat ? "#FFF" : theme.text, fontWeight: "600" }}
            >
              {cat}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredVaccines}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VaccineCard vaccine={item} onBook={handleBook} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
      />

      <BookingModal
        visible={showBooking}
        vaccine={bookingVaccine}
        onClose={() => setShowBooking(false)}
        onConfirm={() => { setShowBooking(false); setShowSuccess(true); }}
      />
      <SuccessModal visible={showSuccess} onClose={() => setShowSuccess(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenHeader: { marginBottom: Spacing.lg },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesRow: { marginBottom: Spacing.md, marginHorizontal: -Spacing.lg },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  vaccineCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  vaccineCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  vaccineIconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryText: { fontSize: 11, fontWeight: "700" },
  vaccineName: { marginBottom: Spacing.sm },
  ageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  ageText: { fontSize: 12, fontWeight: "600" },
  vaccineDesc: { marginBottom: Spacing.md, lineHeight: 20 },
  doseInfo: { flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.lg },
  doseItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  doseText: { fontSize: 12 },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  bookButtonText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
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
  selectedVaccineCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionLabel: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  dosesRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  doseChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
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
  locationInput: {
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
