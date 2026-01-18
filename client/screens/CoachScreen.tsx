import React, { useState } from "react";
import { StyleSheet, View, FlatList, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { HealthCard } from "@/components/HealthCard";
import { MedicineCard } from "@/components/MedicineCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const INITIAL_MEDICINES: Medicine[] = [
  { id: "1", name: "Metformin", dosage: "500mg - 1 tablet", time: "8:00 AM", taken: false },
  { id: "2", name: "Vitamin D3", dosage: "1000 IU - 1 capsule", time: "9:00 AM", taken: false },
  { id: "3", name: "Omega-3", dosage: "1000mg - 2 capsules", time: "1:00 PM", taken: false },
];

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [selectedSegment, setSelectedSegment] = useState(0);
  const [waterCompleted, setWaterCompleted] = useState(false);
  const [waterProgress, setWaterProgress] = useState(0.4);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);

  const takenMedicines = medicines.filter((m) => m.taken).length;
  const totalTasks = medicines.length + 1;
  const completedTasks = takenMedicines + (waterCompleted ? 1 : 0);

  const handleWaterDone = () => {
    if (waterProgress < 1) {
      const newProgress = Math.min(waterProgress + 0.2, 1);
      setWaterProgress(newProgress);
      if (newProgress >= 1) {
        setWaterCompleted(true);
      }
    }
  };

  const handleMedicineTaken = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {getGreeting()}
        </ThemedText>
        <ThemedText type="h2">Sarah Johnson</ThemedText>
      </View>
      <Pressable
        style={[
          styles.profileButton,
          {
            backgroundColor: isDark
              ? Colors.dark.backgroundSecondary
              : Colors.light.backgroundSecondary,
          },
        ]}
      >
        <Feather name="user" size={22} color={theme.primary} />
      </Pressable>
    </View>
  );

  const renderContent = () => (
    <View>
      <SegmentedControl
        segments={["Daily Task", "Your Coach"]}
        selectedIndex={selectedSegment}
        onSelect={setSelectedSegment}
      />

      {selectedSegment === 0 ? (
        <>
          <HealthCard
            title="Daily Progress"
            subtitle={`${completedTasks}/${totalTasks} tasks completed`}
            icon="award"
            progress={completedTasks / totalTasks}
            progressLabel={`${Math.round((completedTasks / totalTasks) * 100)}%`}
            gradient
          />

          <HealthCard
            title="Drink Water"
            subtitle="Daily goal: 2.5 liters"
            icon="droplet"
            progress={waterProgress}
            progressLabel={`${Math.round(waterProgress * 2.5 * 10) / 10}L / 2.5L`}
            actionLabel={waterCompleted ? "Completed" : "Add Glass"}
            onAction={handleWaterDone}
            completed={waterCompleted}
          />

          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Medicine Reminders</ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
            >
              {takenMedicines}/{medicines.length}
            </ThemedText>
          </View>

          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              name={medicine.name}
              dosage={medicine.dosage}
              time={medicine.time}
              taken={medicine.taken}
              onMarkTaken={() => handleMedicineTaken(medicine.id)}
            />
          ))}
        </>
      ) : (
        <View style={styles.coachContent}>
          <View
            style={[
              styles.coachCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.coachHeader}>
              <View
                style={[
                  styles.coachAvatar,
                  {
                    backgroundColor: isDark
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                  },
                ]}
              >
                <Feather name="heart" size={24} color={theme.primary} />
              </View>
              <View style={styles.coachInfo}>
                <ThemedText type="h4">Health Coach</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Your personal wellness guide
                </ThemedText>
              </View>
            </View>
            <View style={styles.coachTips}>
              <View style={styles.tipItem}>
                <Feather name="sun" size={18} color={theme.primary} />
                <ThemedText type="body" style={styles.tipText}>
                  Start your day with 10 minutes of stretching
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <Feather name="moon" size={18} color={theme.primary} />
                <ThemedText type="body" style={styles.tipText}>
                  Get 7-8 hours of sleep tonight
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <Feather name="activity" size={18} color={theme.primary} />
                <ThemedText type="body" style={styles.tipText}>
                  Walk 5,000 steps today for better health
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/illustrations/empty_tasks_illustration.png")}
      title="All Caught Up!"
      description="You've completed all your tasks for today. Great job staying on top of your health!"
    />
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["5xl"],
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={[1]}
      keyExtractor={() => "content"}
      renderItem={() => renderContent()}
      ListHeaderComponent={renderHeader}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  coachContent: {
    flex: 1,
  },
  coachCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  coachHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  coachAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  coachInfo: {
    flex: 1,
  },
  coachTips: {
    gap: Spacing.lg,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  tipText: {
    flex: 1,
  },
});
