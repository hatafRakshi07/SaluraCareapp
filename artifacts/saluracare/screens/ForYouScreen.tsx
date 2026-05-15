import React, { useState } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { RecommendationCard } from "@/components/RecommendationCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "article" | "product" | "tip";
  image?: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "5 Easy Exercises for Better Joint Health",
    description: "Simple stretches you can do at home to improve flexibility and reduce pain in your joints.",
    type: "article",
  },
  {
    id: "2",
    title: "Premium Vitamin D3 Supplements",
    description: "Boost your immune system with our highest-rated vitamin D supplements, now 20% off.",
    type: "product",
  },
  {
    id: "3",
    title: "Stay Hydrated This Summer",
    description: "Your body needs at least 8 glasses of water daily. Set reminders to meet your hydration goals.",
    type: "tip",
  },
  {
    id: "4",
    title: "Managing Diabetes: A Complete Guide",
    description: "Learn about diet, exercise, and lifestyle changes that can help manage blood sugar levels.",
    type: "article",
  },
  {
    id: "5",
    title: "Digital Blood Pressure Monitor",
    description: "Track your blood pressure at home with this easy-to-use, FDA-approved monitor.",
    type: "product",
  },
];

export default function ForYouScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [recommendations] = useState<Recommendation[]>(RECOMMENDATIONS);

  const handlePress = (id: string) => {
    console.log("Pressed recommendation:", id);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="h2">For You</ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        Personalized health recommendations
      </ThemedText>
    </View>
  );

  const renderItem = ({ item }: { item: Recommendation }) => (
    <RecommendationCard
      id={item.id}
      title={item.title}
      description={item.description}
      type={item.type}
      image={item.image}
      onPress={handlePress}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../assets/images/illustrations/empty_tasks_illustration.png")}
      title="No Recommendations Yet"
      description="We're learning about your preferences. Check back soon for personalized health content!"
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
        recommendations.length === 0 && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={recommendations}
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
    marginBottom: Spacing["2xl"],
  },
});
