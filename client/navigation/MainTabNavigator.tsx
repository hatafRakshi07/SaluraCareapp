import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CoachScreen from "@/screens/CoachScreen";
import ForYouScreen from "@/screens/ForYouScreen";
import ShopScreen from "@/screens/ShopScreen";
import ReorderScreen from "@/screens/ReorderScreen";
import ServicesScreen from "@/screens/ServicesScreen";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export type MainTabParamList = {
  Coach: undefined;
  ForYou: undefined;
  Shop: undefined;
  Reorder: undefined;
  Services: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabContent() {
  const { theme, isDark } = useTheme();
  const screenOptions = useScreenOptions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSOSPress = () => {
    navigation.navigate("SOS");
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Coach"
        screenOptions={{
          ...screenOptions,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: Platform.select({
              ios: "transparent",
              android: theme.backgroundRoot,
            }),
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        <Tab.Screen
          name="Coach"
          component={CoachScreen}
          options={{
            headerTitle: () => <HeaderTitle title="SaluraCare" />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ForYou"
          component={ForYouScreen}
          options={{
            title: "For You",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="star" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Shop"
          component={ShopScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="shopping-bag" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Reorder"
          component={ReorderScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="rotate-ccw" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Services"
          component={ServicesScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <SOSButton onPress={handleSOSPress} />
    </View>
  );
}

export default function MainTabNavigator() {
  return <TabContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
