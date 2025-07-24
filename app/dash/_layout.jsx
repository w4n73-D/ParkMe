import React from "react";
import { Stack, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const RootLayout = () => {
  return (
    <>
      <Tabs>
        <Tabs.Screen
          name="freelots"
          options={{
            title: "Detect Free Lots",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="camera" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            headerShown: false,
            title: "Account",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="lot-analysis"
          options={{
            href: null,
            title: "Lot Analysis",
          }}
        />
      </Tabs>
    </>
  );
};

export default RootLayout;
