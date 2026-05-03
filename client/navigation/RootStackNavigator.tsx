import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import SOSScreen from "@/screens/SOSScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { RootStackParamList } from "@/navigation/types";

export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SOS"
        component={SOSScreen}
        options={{
          presentation: "modal",
          headerTitle: "Emergency",
          headerTintColor: "#E53935",
        }}
      />
    </Stack.Navigator>
  );
}
