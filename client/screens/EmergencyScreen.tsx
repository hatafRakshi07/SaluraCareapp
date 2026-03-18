import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Linking,
  Platform,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: "1", name: "Ambulance", phone: "102", relation: "Emergency" },
  { id: "2", name: "Police", phone: "100", relation: "Emergency" },
  { id: "3", name: "Fire Brigade", phone: "101", relation: "Emergency" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AddContactModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (contact: Omit<EmergencyContact, "id">) => void;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) return;
    onAdd({ name: name.trim(), phone: phone.trim(), relation: relation.trim() || "Contact" });
    setName("");
    setPhone("");
    setRelation("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={onClose}>
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">Add Emergency Contact</ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={{ padding: Spacing.lg }}>
          <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. John Smith"
            placeholderTextColor={theme.textSecondary}
            style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            testID="input-contact-name"
          />
          <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>Phone Number</ThemedText>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 555-0123"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            testID="input-contact-phone"
          />
          <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>Relation</ThemedText>
          <TextInput
            value={relation}
            onChangeText={setRelation}
            placeholder="e.g. Spouse, Doctor, Parent"
            placeholderTextColor={theme.textSecondary}
            style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            testID="input-contact-relation"
          />
          <Pressable
            onPress={handleAdd}
            style={[styles.addButton, { backgroundColor: name.trim() && phone.trim() ? theme.primary : theme.border }]}
            testID="button-add-contact"
          >
            <ThemedText style={styles.addButtonText}>Add Contact</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function EmergencyScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_CONTACTS);
  const [showAddContact, setShowAddContact] = useState(false);

  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const pulseOuterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: (2 - pulseScale.value) * 0.4,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRequestAmbulance = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    buttonScale.value = withSpring(0.88, {}, () => {
      buttonScale.value = withSpring(1);
    });
    setAmbulanceRequested(true);
  };

  const handleReset = () => {
    setAmbulanceRequested(false);
  };

  const handleCallContact = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const phoneNumber = Platform.OS === "ios" ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(phoneNumber).catch(() => {});
  };

  const handleAddContact = (contact: Omit<EmergencyContact, "id">) => {
    setContacts((prev) => [...prev, { ...contact, id: Date.now().toString() }]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteContact = (id: string) => {
    if (DEFAULT_CONTACTS.some((c) => c.id === id)) return;
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const isSystemContact = (id: string) => DEFAULT_CONTACTS.some((c) => c.id === id);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <ThemedText type="h2">Emergency SOS</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {ambulanceRequested ? "Help is on the way!" : "Press the button for immediate ambulance assistance"}
          </ThemedText>
        </View>

        <View style={styles.sosSection}>
          {!ambulanceRequested ? (
            <View style={styles.sosButtonContainer}>
              <Animated.View style={[styles.pulseOuter, pulseOuterStyle, { backgroundColor: Colors.light.error }]} />
              <Animated.View style={[styles.pulse, pulseStyle, { backgroundColor: Colors.light.error }]} />
              <AnimatedPressable
                onPress={handleRequestAmbulance}
                style={[styles.sosButton, buttonStyle]}
                testID="button-sos"
              >
                <Feather name="phone-call" size={44} color="#FFFFFF" />
                <ThemedText type="h4" style={styles.sosButtonText}>
                  Request{"\n"}Ambulance
                </ThemedText>
              </AnimatedPressable>
            </View>
          ) : (
            <Animated.View entering={FadeInDown.springify()} style={styles.dispatchedContainer}>
              <View style={[styles.dispatchedCard, { backgroundColor: theme.cardBackground }, Shadows.card]}>
                <View style={styles.dispatchedHeader}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.light.success }]} />
                  <ThemedText type="h4">Ambulance Dispatched</ThemedText>
                </View>
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                  Estimated arrival: 8-12 minutes
                </ThemedText>
                <View style={styles.dispatchMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="truck" size={18} color={theme.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.sm }}>Unit #142</ThemedText>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="map-pin" size={18} color={theme.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.sm }}>2.3 km away</ThemedText>
                  </View>
                </View>
              </View>
              <Pressable onPress={handleReset} style={[styles.cancelButton, { borderColor: Colors.light.error }]}>
                <ThemedText style={{ color: Colors.light.error, fontWeight: "600" }}>Cancel Request</ThemedText>
              </Pressable>
            </Animated.View>
          )}
        </View>

        <View style={styles.contactsHeader}>
          <ThemedText type="h4">Emergency Contacts</ThemedText>
          <Pressable
            onPress={() => setShowAddContact(true)}
            style={[styles.addContactBtn, { backgroundColor: theme.primary + "15" }]}
            testID="button-add-emergency-contact"
          >
            <Feather name="plus" size={16} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: "700" }}>Add</ThemedText>
          </Pressable>
        </View>

        {contacts.map((contact, i) => (
          <Animated.View key={contact.id} entering={FadeInDown.delay(i * 50).springify()}>
            <Pressable
              onPress={() => handleCallContact(contact.phone)}
              style={[styles.contactCard, { backgroundColor: theme.cardBackground }, Shadows.card]}
              testID={`card-contact-${contact.id}`}
            >
              <View
                style={[
                  styles.contactAvatar,
                  {
                    backgroundColor:
                      contact.relation === "Emergency"
                        ? Colors.light.error + "20"
                        : theme.primary + "18",
                  },
                ]}
              >
                <Feather
                  name={contact.relation === "Emergency" ? "phone" : "user"}
                  size={18}
                  color={contact.relation === "Emergency" ? Colors.light.error : theme.primary}
                />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText type="body" style={{ fontWeight: "700" }}>{contact.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {contact.relation} · {contact.phone}
                </ThemedText>
              </View>
              <View style={styles.contactActions}>
                <View style={[styles.callBtn, { backgroundColor: Colors.light.success + "15" }]}>
                  <Feather name="phone" size={16} color={Colors.light.success} />
                </View>
                {!isSystemContact(contact.id) ? (
                  <Pressable
                    onPress={() => handleDeleteContact(contact.id)}
                    style={[styles.deleteBtn, { backgroundColor: Colors.light.error + "15" }]}
                    testID={`button-delete-contact-${contact.id}`}
                  >
                    <Feather name="trash-2" size={14} color={Colors.light.error} />
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        ))}

        <View style={[styles.tipCard, { backgroundColor: theme.cardBackground }, Shadows.card]}>
          <Feather name="alert-circle" size={18} color={Colors.light.warning ?? "#FF9800"} />
          <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1, lineHeight: 18 }}>
            In a life-threatening emergency, always call your local emergency number directly. This app supplements but does not replace emergency services.
          </ThemedText>
        </View>
      </ScrollView>

      <AddContactModal
        visible={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAdd={handleAddContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleSection: { marginBottom: Spacing.xl },
  sosSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  sosButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
  },
  pulse: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: BorderRadius.full,
  },
  pulseOuter: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: BorderRadius.full,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.error,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sos,
  },
  sosButtonText: {
    color: "#FFFFFF",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  dispatchedContainer: { width: "100%", gap: Spacing.md },
  dispatchedCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  dispatchedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  dispatchMeta: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  cancelButton: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  contactsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  addContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contactInfo: { flex: 1 },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  fieldLabel: { marginBottom: Spacing.xs, marginTop: Spacing.md },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
  },
  addButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  addButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
