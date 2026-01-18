import React, { useState } from "react";
import { StyleSheet, View, FlatList, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ServiceProviderCard } from "@/components/ServiceProviderCard";
import { CategoryChip } from "@/components/CategoryChip";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ServiceProvider {
  id: string;
  name: string;
  role: string;
  experience: number;
  available: boolean;
  rating: number;
  category: string;
}

const CATEGORIES = ["All", "Home Nurse", "Caretaker", "Physiotherapist"];

const PROVIDERS: ServiceProvider[] = [
  { id: "1", name: "Dr. Emily Watson", role: "Physiotherapist", experience: 8, available: true, rating: 4.9, category: "Physiotherapist" },
  { id: "2", name: "Maria Garcia", role: "Home Nurse", experience: 5, available: true, rating: 4.8, category: "Home Nurse" },
  { id: "3", name: "James Wilson", role: "Caretaker", experience: 3, available: false, rating: 4.6, category: "Caretaker" },
  { id: "4", name: "Dr. Sarah Chen", role: "Neuro Physiotherapist", experience: 12, available: true, rating: 4.9, category: "Physiotherapist" },
  { id: "5", name: "Robert Brown", role: "Home Nurse", experience: 7, available: true, rating: 4.7, category: "Home Nurse" },
  { id: "6", name: "Linda Martinez", role: "Elderly Care Specialist", experience: 10, available: true, rating: 4.8, category: "Caretaker" },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProviders = PROVIDERS.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBook = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log("Book provider:", id);
  };

  const handleFilter = () => {
    console.log("Open filter");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="h2">Services</ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        Book healthcare professionals
      </ThemedText>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search providers..."
          showFilter
          onFilter={handleFilter}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <ThemedText type="h4">
          Available Providers
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {filteredProviders.filter((p) => p.available).length} available
        </ThemedText>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ServiceProvider }) => (
    <ServiceProviderCard
      id={item.id}
      name={item.name}
      role={item.role}
      experience={item.experience}
      available={item.available}
      rating={item.rating}
      onBook={handleBook}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/illustrations/empty_services_illustration.png")}
      title="No Providers Found"
      description="We couldn't find any providers matching your search. Try adjusting your filters."
      actionLabel="Clear Filters"
      onAction={() => {
        setSearchQuery("");
        setSelectedCategory("All");
      }}
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
        filteredProviders.length === 0 && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={filteredProviders}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
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
  emptyContent: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.md,
  },
  searchSection: {
    marginTop: Spacing.xl,
  },
  categoriesContainer: {
    marginHorizontal: -Spacing.lg,
    marginTop: -Spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
});
