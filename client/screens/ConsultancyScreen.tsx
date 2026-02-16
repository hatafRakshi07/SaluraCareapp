import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ConsultationCard } from "@/components/ConsultationCard";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { SPECIALTIES, type Specialty } from "@/lib/doctors";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getConsultations,
  addConsultation,
  cancelConsultation,
  type Consultation,
} from "@/lib/consultations";

const CONSULTATION_TYPES = [
  "General Consultation",
  "Mental Health",
  "Dermatology",
  "Nutrition & Diet",
  "Pediatrics",
  "Orthopedics",
  "Cardiology",
  "Gynecology",
];

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
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

export default function ConsultancyScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSpecialtyPress = (specialty: Specialty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rootNavigation.navigate("DoctorList", { specialtyName: specialty.name });
  };

  const [selectedSegment, setSelectedSegment] = useState(0);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");

  const [showTypePicker, setShowTypePicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      loadConsultations();
    }, [])
  );

  const loadConsultations = async () => {
    setLoading(true);
    const data = await getConsultations();
    setConsultations(data);
    setLoading(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!consultationType) newErrors.consultationType = "Please select a consultation type";
    if (!selectedDate) newErrors.date = "Please select a date";
    if (!selectedTime) newErrors.time = "Please select a time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSubmitting(true);
    try {
      await addConsultation({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        consultationType,
        date: selectedDate,
        timeSlot: selectedTime,
        message: message.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);

      setFullName("");
      setEmail("");
      setPhone("");
      setConsultationType("");
      setSelectedDate("");
      setSelectedTime("");
      setMessage("");
      setErrors({});

      await loadConsultations();

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to book consultation:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    await cancelConsultation(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await loadConsultations();
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    errorKey: string,
    options?: {
      placeholder?: string;
      keyboardType?: TextInput["props"]["keyboardType"];
      multiline?: boolean;
      autoCapitalize?: TextInput["props"]["autoCapitalize"];
    }
  ) => (
    <View style={styles.fieldContainer}>
      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          if (errors[errorKey]) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next[errorKey];
              return next;
            });
          }
        }}
        placeholder={options?.placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.textSecondary}
        keyboardType={options?.keyboardType || "default"}
        multiline={options?.multiline || false}
        autoCapitalize={options?.autoCapitalize || "sentences"}
        style={[
          styles.input,
          {
            backgroundColor: isDark
              ? Colors.dark.backgroundSecondary
              : Colors.light.backgroundSecondary,
            color: theme.text,
            borderColor: errors[errorKey] ? Colors.light.error : "transparent",
            borderWidth: errors[errorKey] ? 1.5 : 0,
          },
          options?.multiline && styles.multilineInput,
        ]}
        testID={`input-${errorKey}`}
      />
      {errors[errorKey] ? (
        <ThemedText type="caption" style={styles.errorText}>
          {errors[errorKey]}
        </ThemedText>
      ) : null}
    </View>
  );

  const renderBookingForm = () => (
    <View>
      {showSuccess ? (
        <View
          style={[
            styles.successBanner,
            { backgroundColor: Colors.light.success + "15" },
          ]}
        >
          <Feather name="check-circle" size={20} color={Colors.light.success} />
          <ThemedText
            type="small"
            style={{ color: Colors.light.success, marginLeft: Spacing.sm, fontWeight: "600" }}
          >
            Appointment booked successfully!
          </ThemedText>
        </View>
      ) : null}

      {renderFormField("Full Name", fullName, setFullName, "fullName", {
        placeholder: "Enter your full name",
        autoCapitalize: "words",
      })}

      {renderFormField("Email", email, setEmail, "email", {
        placeholder: "name@example.com",
        keyboardType: "email-address",
        autoCapitalize: "none",
      })}

      {renderFormField("Phone", phone, setPhone, "phone", {
        placeholder: "+1 (555) 000-0000",
        keyboardType: "phone-pad",
      })}

      <View style={styles.fieldContainer}>
        <ThemedText type="small" style={[styles.fieldLabel, { color: theme.text }]}>
          Consultation Type
        </ThemedText>
        <Pressable
          onPress={() => setShowTypePicker(true)}
          style={[
            styles.input,
            styles.pickerButton,
            {
              backgroundColor: isDark
                ? Colors.dark.backgroundSecondary
                : Colors.light.backgroundSecondary,
              borderColor: errors.consultationType ? Colors.light.error : "transparent",
              borderWidth: errors.consultationType ? 1.5 : 0,
            },
          ]}
          testID="button-consultation-type"
        >
          <ThemedText
            type="body"
            style={{
              color: consultationType ? theme.text : theme.textSecondary,
              flex: 1,
            }}
          >
            {consultationType || "Select consultation type"}
          </ThemedText>
          <Feather name="chevron-down" size={18} color={theme.textSecondary} />
        </Pressable>
        {errors.consultationType ? (
          <ThemedText type="caption" style={styles.errorText}>
            {errors.consultationType}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.fieldContainer}>
        <ThemedText type="small" style={[styles.fieldLabel, { color: theme.text }]}>
          Select Date
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {DATE_OPTIONS.map((date) => (
            <Pressable
              key={date.value}
              onPress={() => {
                setSelectedDate(date.value);
                if (errors.date) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.date;
                    return next;
                  });
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.dateChip,
                {
                  backgroundColor:
                    selectedDate === date.value
                      ? theme.primary
                      : isDark
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                  borderColor: errors.date && !selectedDate
                    ? Colors.light.error
                    : selectedDate === date.value
                    ? theme.primary
                    : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: selectedDate === date.value ? "#FFFFFF" : theme.text,
                  fontWeight: selectedDate === date.value ? "600" : "400",
                }}
              >
                {date.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
        {errors.date ? (
          <ThemedText type="caption" style={styles.errorText}>
            {errors.date}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.fieldContainer}>
        <ThemedText type="small" style={[styles.fieldLabel, { color: theme.text }]}>
          Select Time Slot
        </ThemedText>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => {
                setSelectedTime(slot);
                if (errors.time) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.time;
                    return next;
                  });
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.timeChip,
                {
                  backgroundColor:
                    selectedTime === slot
                      ? theme.primary
                      : isDark
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                  borderColor: errors.time && !selectedTime
                    ? Colors.light.error
                    : selectedTime === slot
                    ? theme.primary
                    : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: selectedTime === slot ? "#FFFFFF" : theme.text,
                  fontWeight: selectedTime === slot ? "600" : "400",
                  textAlign: "center",
                }}
              >
                {slot}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {errors.time ? (
          <ThemedText type="caption" style={styles.errorText}>
            {errors.time}
          </ThemedText>
        ) : null}
      </View>

      {renderFormField("Message (Optional)", message, setMessage, "message", {
        placeholder: "Describe your symptoms or concerns...",
        multiline: true,
      })}

      <Button
        onPress={handleSubmit}
        disabled={submitting}
        style={styles.submitButton}
      >
        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <ThemedText type="body" style={styles.submitButtonText}>
              {"  Booking..."}
            </ThemedText>
          </View>
        ) : (
          "Book Appointment"
        )}
      </Button>
    </View>
  );

  const renderAppointments = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            Loading appointments...
          </ThemedText>
        </View>
      );
    }

    if (consultations.length === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/illustrations/empty_consultancy_illustration.png")}
          title="No Appointments Yet"
          description="Book your first online consultation to get started with your healthcare journey."
          actionLabel="Book Now"
          onAction={() => setSelectedSegment(0)}
        />
      );
    }

    return (
      <View>
        {consultations.map((consultation) => (
          <ConsultationCard
            key={consultation.id}
            consultation={consultation}
            onCancel={handleCancel}
          />
        ))}
      </View>
    );
  };

  const renderTypePicker = () => (
    <Modal
      visible={showTypePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTypePicker(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowTypePicker(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <ThemedText type="h4">Select Consultation Type</ThemedText>
            <Pressable
              onPress={() => setShowTypePicker(false)}
              style={styles.modalClose}
            >
              <Feather name="x" size={22} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalList}>
            {CONSULTATION_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  setConsultationType(type);
                  setShowTypePicker(false);
                  if (errors.consultationType) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.consultationType;
                      return next;
                    });
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.modalItem,
                  {
                    backgroundColor:
                      consultationType === type
                        ? theme.primary + "15"
                        : "transparent",
                    borderBottomColor: theme.divider,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: consultationType === type ? theme.primary : theme.text,
                    fontWeight: consultationType === type ? "600" : "400",
                  }}
                >
                  {type}
                </ThemedText>
                {consultationType === type ? (
                  <Feather name="check" size={18} color={theme.primary} />
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["5xl"],
          },
          selectedSegment === 1 && consultations.length === 0 && !loading && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={[1]}
        keyExtractor={() => "content"}
        renderItem={() => (
          <View>
            <View style={styles.specialtiesSection}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Browse by Specialties
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
                Find the right doctor for your needs
              </ThemedText>
              <View style={styles.specialtiesGrid}>
                {SPECIALTIES.map((specialty) => (
                  <SpecialtyCard
                    key={specialty.id}
                    specialty={specialty}
                    onPress={handleSpecialtyPress}
                  />
                ))}
              </View>
            </View>

            <View style={styles.segmentContainer}>
              <SegmentedControl
                segments={["Book Appointment", "My Appointments"]}
                selectedIndex={selectedSegment}
                onSelect={setSelectedSegment}
              />
            </View>

            {selectedSegment === 0 ? renderBookingForm() : renderAppointments()}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="h2">Online Consultancy</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Book a virtual appointment with our experts
            </ThemedText>
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      {renderTypePicker()}
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
  specialtiesSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  segmentContainer: {
    marginBottom: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  horizontalScroll: {
    marginHorizontal: -Spacing.lg,
  },
  horizontalScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  dateChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  timeChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: 90,
    alignItems: "center",
  },
  errorText: {
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing["3xl"],
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.15)",
  },
  modalClose: {
    padding: Spacing.xs,
  },
  modalList: {
    paddingHorizontal: Spacing.xl,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
});
