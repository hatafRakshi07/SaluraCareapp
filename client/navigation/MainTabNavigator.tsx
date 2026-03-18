import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

import CoachScreen from "@/screens/CoachScreen";
import ForYouScreen from "@/screens/ForYouScreen";
import LabTestScreen from "@/screens/LabTestScreen";
import VaccinationScreen from "@/screens/VaccinationScreen";
import ServicesScreen from "@/screens/ServicesScreen";
import EmergencyScreen from "@/screens/EmergencyScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Colors } from "@/constants/theme";

export type MainTabParamList = {
  Home: undefined;
  ForYou: undefined;
  LabTests: undefined;
  Vaccination: undefined;
  Services: undefined;
  Emergency: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const screenOptions = useScreenOptions();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
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
            fontSize: 10,
            fontWeight: "500",
          },
        }}
      >
        <Tab.Screen
          name="Home"
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
          name="LabTests"
          component={LabTestScreen}
          options={{
            title: "Lab Tests",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="activity" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Vaccination"
          component={VaccinationScreen}
          options={{
            title: "Vaccines",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="shield" size={size} color={color} />
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
        <Tab.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: Colors.light.error,
            tabBarIcon: ({ color, size }) => (
              <Feather name="phone-call" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerTitle: "My Profile",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
