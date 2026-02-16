import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import SOSScreen from "@/screens/SOSScreen";
import DoctorListScreen from "@/screens/DoctorListScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  SOS: undefined;
  DoctorList: { specialtyName: string };
};

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
      <Stack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={({ route }) => ({
          headerTitle: route.params.specialtyName,
        })}
      />
    </Stack.Navigator>
  );
}
