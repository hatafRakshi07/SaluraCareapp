import React, { useState } from "react";
import { StyleSheet, View, FlatList, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ProductCard } from "@/components/ProductCard";
import { CategoryChip } from "@/components/CategoryChip";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: string;
  category: string;
  rentable: boolean;
}

const CATEGORIES = ["All", "Masks", "Gloves", "Syringes", "Dressing", "Equipment"];

const PRODUCTS: Product[] = [
  { id: "1", name: "N95 Face Masks (50 Pack)", price: 24.99, quantity: "50 pcs", category: "Masks", rentable: false },
  { id: "2", name: "Surgical Gloves Latex Free", price: 12.99, quantity: "100 pcs", category: "Gloves", rentable: false },
  { id: "3", name: "Insulin Syringes 1ml", price: 18.50, quantity: "100 pcs", category: "Syringes", rentable: false },
  { id: "4", name: "Sterile Gauze Pads", price: 8.99, quantity: "25 pcs", category: "Dressing", rentable: false },
  { id: "5", name: "Blood Pressure Monitor", price: 49.99, quantity: "1 unit", category: "Equipment", rentable: true },
  { id: "6", name: "Wheelchair - Standard", price: 15.00, quantity: "Per day", category: "Equipment", rentable: true },
  { id: "7", name: "Medical Tape Rolls", price: 6.99, quantity: "6 rolls", category: "Dressing", rentable: false },
  { id: "8", name: "Disposable Syringes 5ml", price: 14.99, quantity: "50 pcs", category: "Syringes", rentable: false },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCartCount((prev) => prev + 1);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <ThemedText type="h2">SaluraMart</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Medical supplies delivered to your door
          </ThemedText>
        </View>
        <Pressable
          style={[
            styles.cartButton,
            {
              backgroundColor: isDark
                ? Colors.dark.backgroundSecondary
                : Colors.light.backgroundSecondary,
            },
          ]}
        >
          <Feather name="shopping-cart" size={22} color={theme.primary} />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <ThemedText type="caption" style={styles.cartBadgeText}>
                {cartCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search Medical Supplies"
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
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/illustrations/empty_shop_illustration.png")}
      title="No Products Found"
      description="We couldn't find any products matching your search. Try a different category or search term."
      actionLabel="Clear Filters"
      onAction={() => {
        setSearchQuery("");
        setSelectedCategory("All");
      }}
    />
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productWrapper, index % 2 === 0 && styles.leftProduct]}>
      <ProductCard
        id={item.id}
        name={item.name}
        price={item.price}
        quantity={item.quantity}
        rentable={item.rentable}
        onAddToCart={handleAddToCart}
      />
    </View>
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
          filteredProducts.length === 0 && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: Spacing.md,
  },
  emptyContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.light.error,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  categoriesContainer: {
    marginHorizontal: -Spacing.xs,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.xs,
  },
  row: {
    justifyContent: "space-between",
  },
  productWrapper: {
    flex: 1,
    maxWidth: "50%",
  },
  leftProduct: {
    paddingRight: Spacing.xs,
  },
});
