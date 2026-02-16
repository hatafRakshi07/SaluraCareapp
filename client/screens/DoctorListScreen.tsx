import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { DoctorCard } from "@/components/DoctorCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { getDoctorsBySpecialty, type Doctor } from "@/lib/doctors";
import { addConsultation } from "@/lib/consultations";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const generateDateOptions = () => {
  const dates: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      value: date.toISOString().split("T")[0],
    });
  }
  return dates;
};

const DATE_OPTIONS = generateDateOptions();

export default function DoctorListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, "DoctorList">>();
  const navigation = useNavigation();
  const { specialtyName } = route.params;

  const doctors = useMemo(
    () => getDoctorsBySpecialty(specialtyName),
    [specialtyName]
  );

  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBook = useCallback((doctor: Doctor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBookingDoctor(doctor);
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setSelectedDate("");
    setSelectedTime("");
    setMessage("");
    setErrors({});
  };

  const closeBooking = () => {
    setBookingDoctor(null);
    resetForm();
    setShowSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!selectedDate) newErrors.date = "Select a date";
    if (!selectedTime) newErrors.time = "Select a time slot";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!bookingDoctor || !validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSubmitting(true);
    try {
      await addConsultation({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        consultationType: specialtyName,
        date: selectedDate,
        timeSlot: selectedTime,
        message: `Consultation with ${bookingDoctor.name}. ${message.trim()}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      resetForm();
      setTimeout(() => closeBooking(), 2000);
    } catch (error) {
      console.error("Booking failed:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderBookingModal = () => (
    <Modal
      visible={bookingDoctor !== null}
      transparent
      animationType="slide"
      onRequestClose={closeBooking}
    >
      <Pressable style={styles.modalOverlay} onPress={closeBooking}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.cardBackground }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHandle} />

          {showSuccess ? (
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: Colors.light.success + "15" }]}>
                <Feather name="check-circle" size={48} color={Colors.light.success} />
              </View>
              <ThemedText type="h3" style={styles.successTitle}>
                Booked Successfully
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                Your appointment has been scheduled.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <ThemedText type="h4">Book Appointment</ThemedText>
                <Pressable onPress={closeBooking} style={styles.modalCloseBtn}>
                  <Feather name="x" size={22} color={theme.text} />
                </Pressable>
              </View>

              {bookingDoctor ? (
                <View style={[styles.doctorSummary, { backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary }]}>
                  <Feather name="user" size={18} color={theme.primary} />
                  <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {bookingDoctor.name}
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {specialtyName}
                    </ThemedText>
                  </View>
                </View>
              ) : null}

              <View style={styles.formField}>
                <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Full Name</ThemedText>
                <TextInput
                  value={fullName}
                  onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors((p) => { const n = { ...p }; delete n.fullName; return n; }); }}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  style={[styles.input, { backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary, color: theme.text, borderColor: errors.fullName ? Colors.light.error : "transparent", borderWidth: errors.fullName ? 1.5 : 0 }]}
                  testID="booking-input-fullName"
                />
                {errors.fullName ? <ThemedText type="caption" style={styles.errorText}>{errors.fullName}</ThemedText> : null}
              </View>

              <View style={styles.formField}>
                <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Email</ThemedText>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary, color: theme.text, borderColor: errors.email ? Colors.light.error : "transparent", borderWidth: errors.email ? 1.5 : 0 }]}
                  testID="booking-input-email"
                />
                {errors.email ? <ThemedText type="caption" style={styles.errorText}>{errors.email}</ThemedText> : null}
              </View>

              <View style={styles.formField}>
                <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Phone</ThemedText>
                <TextInput
                  value={phone}
                  onChangeText={(t) => { setPhone(t); if (errors.phone) setErrors((p) => { const n = { ...p }; delete n.phone; return n; }); }}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                  style={[styles.input, { backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary, color: theme.text, borderColor: errors.phone ? Colors.light.error : "transparent", borderWidth: errors.phone ? 1.5 : 0 }]}
                  testID="booking-input-phone"
                />
                {errors.phone ? <ThemedText type="caption" style={styles.errorText}>{errors.phone}</ThemedText> : null}
              </View>

              <View style={styles.formField}>
                <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Select Date</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {DATE_OPTIONS.map((d) => (
                    <Pressable
                      key={d.value}
                      onPress={() => { setSelectedDate(d.value); if (errors.date) setErrors((p) => { const n = { ...p }; delete n.date; return n; }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={[styles.chip, { backgroundColor: selectedDate === d.value ? theme.primary : isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary, borderColor: errors.date && !selectedDate ? Colors.light.error : selectedDate === d.value ? theme.primary : theme.border }]}
                    >
                      <ThemedText type="small" style={{ color: selectedDate === d.value ? "#FFF" : theme.text, fontWeight: selectedDate === d.value ? "600" : "400" }}>{d.label}</ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
                {errors.date ? <ThemedText type="caption" style={styles.errorText}>{errors.date}</ThemedText> : null}
              </View>

              <View style={styles.formField}>
                <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Select Time</ThemedText>
                <View style={styles.timeGrid}>
                  {TIME_SLOTS.map((slot) => (
                    <Pressable
                      key={slot}
                      onPress={() => { setSelectedTime(slot); if (errors.time) setErrors((p) => { const n = { ...p }; delete n.time; return n; }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={[styles.timeChip, { backgroundColor: selectedTime === slot ? theme.primary : isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary, borderColor: errors.time && !selectedTime ? Colors.light.error : selectedTime === slot ? theme.primary : theme.border }]}
                    >
                      <ThemedText type="small" style={{ color: selectedTime === slot ? "#FFF" : theme.text, fontWeight: selectedTime === slot ? "600" : "400", textAlign: "center" }}>{slot}</ThemedText>
                    </Pressable>
                  ))}
                </View>
                {errors.time ? <ThemedText type="caption" style={styles.errorText}>{errors.time}</ThemedText> : null}
              </View>

              <View style={styles.formField}>
                <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Message (Optional)</ThemedText>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe your symptoms..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  style={[styles.input, styles.multiline, { backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary, color: theme.text }]}
                  testID="booking-input-message"
                />
              </View>

              <Button onPress={handleSubmitBooking} disabled={submitting} style={styles.submitBtn}>
                {submitting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>{"  Booking..."}</ThemedText>
                  </View>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderItem = ({ item }: { item: Doctor }) => (
    <DoctorCard doctor={item} onBook={handleBook} />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/illustrations/empty_consultancy_illustration.png")}
      title="No Doctors Found"
      description={`We don't have any doctors listed under ${specialtyName} yet. Please check back later.`}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing["5xl"] },
          doctors.length === 0 && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="h2">{specialtyName}</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {doctors.length > 0 ? `${doctors.length} doctor${doctors.length > 1 ? "s" : ""} available` : ""}
            </ThemedText>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
      {renderBookingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  emptyContent: { flex: 1 },
  header: { marginBottom: Spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: "90%", paddingBottom: Spacing["3xl"] },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#CCC", alignSelf: "center", marginTop: Spacing.md, marginBottom: Spacing.sm },
  modalScrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing["2xl"] },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  modalCloseBtn: { padding: Spacing.xs },
  doctorSummary: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.sm, marginBottom: Spacing.xl },
  formField: { marginBottom: Spacing.lg },
  label: { fontWeight: "600", marginBottom: Spacing.sm },
  input: { height: Spacing.inputHeight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16 },
  multiline: { height: 80, paddingTop: Spacing.md, textAlignVertical: "top" },
  chipRow: { gap: Spacing.sm },
  chip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.sm, borderWidth: 1 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  timeChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.sm, borderWidth: 1, minWidth: 88, alignItems: "center" },
  errorText: { color: Colors.light.error, marginTop: Spacing.xs },
  submitBtn: { marginTop: Spacing.md },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  successContainer: { alignItems: "center", justifyContent: "center", paddingVertical: Spacing["5xl"], paddingHorizontal: Spacing.xl },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl },
  successTitle: { marginBottom: Spacing.md },
});
